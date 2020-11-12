require('dotenv').config()
const { Telegraf } = require('telegraf')

const retry = require('async-retry')
const BigNumber = require("bignumber.js");
const fs = require('fs');
const express = require('express')
const app = express()
const port = 3000;
const bodyParser = require("body-parser");
const axios = require("axios");

const Twitter = require("twitter");
var clientTwitter = new Twitter({
  consumer_key: process.env._,
  consumer_secret: process.env._,
  access_token_key: process.env._,
  access_token_secret: process.env._
});




var Web3 = require('web3');
web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/4822b98a204340adb33d86bb2e4ae120"));

const pools = [
  { pool: 'Compound', address:'0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56', method: '0xa6417ed6', type: 'stable',
        tokens: {
          0: {name: 'DAI', decimals: 18},
          1: {name: 'USDC', decimals: 6}
        }
  },
  { pool: 'Pax Pool', address:'0x06364f10b501e868329afbc005b3492902d6c763', method: '0xa6417ed6', type: 'stable',
        tokens: {
          0: {name: 'DAI', decimals: 18},
          1: {name: 'USDC', decimals: 6},
          2: {name: 'USDT', decimals: 6},
          3: {name: 'PAX', decimals: 18}
        }
  },
  {pool: 'Y Pool', address:'0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51', method: '0xa6417ed6', type: 'stable',
        tokens: {
          0: {name: 'DAI', decimals: 18},
          1: {name: 'USDC', decimals: 6},
          2: {name: 'USDT', decimals: 6},
          3: {name: 'TUSD', decimals: 18}
        }
  },
  {pool: 'BUSD Pool', address:'0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27', method: '0xa6417ed6', type: 'stable',
        tokens: {
          0: {name: 'DAI', decimals: 18},
          1: {name: 'USDC', decimals: 6},
          2: {name: 'USDT', decimals: 6},
          3: {name: 'BUSD', decimals: 18}
        }
  },
  {pool: 'sUSD Pool', address:'0xa5407eae9ba41422680e2e00537571bcc53efbfd', method: '0x3df02124', type: 'stable',
        tokens: {
          0: {name: 'DAI', decimals: 18},
          1: {name: 'USDC', decimals: 6},
          2: {name: 'USDT', decimals: 6},
          3: {name: 'sUSD', decimals: 18}
        }
  },
  {pool: 'Tri Pool', address:'0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7', method: '0x3df02124', type: 'stable',
        tokens: {
          0: {name: 'DAI', decimals: 18},
          1: {name: 'USDC', decimals: 6},
          2: {name: 'USDT', decimals: 6}
        }
  },
  {pool: 'GUSD Pool', address:'0x4f062658eaaf2c1ccf8c8e36d6824cdf41167956', method: '0xa6417ed6', type: 'stable',
        tokens: {
          0: {name: 'GUSD', decimals: 2},
          1: {name: 'DAI', decimals: 18},
          2: {name: 'USDC', decimals: 6},
          3: {name: 'USDT', decimals: 6}
        }
  },
  {pool: 'USDN Pool', address:'0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1', method: '0xa6417ed6', type: 'stable',
        tokens: {
          0: {name: 'USDN', decimals: 18},
          1: {name: 'DAI', decimals: 18},
          2: {name: 'USDC', decimals: 6},
          3: {name: 'USDT', decimals: 6}
        }
  },
  {pool: 'REN Pool', address:'0x93054188d876f558f4a66B2EF1d97d16eDf0895B', method: '0x3df02124', type: 'btc',
        tokens: {
          0: {name: 'REN', decimals: 8},
          1: {name: 'WBTC', decimals: 8}
        }
  },
  {pool: 'sBTC Pool', address:'0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714', method: '0x3df02124', type: 'btc',
        tokens: {
          0: {name: 'REN', decimals: 8},
          1: {name: 'WBTC', decimals: 8},
          2: {name: 'sBTC', decimals: 18}
        }
  }

];



/*
* EXPRESS CRAP
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

app.post('/trades', (req, res) => {

  txData(req.body);
  res.end();

  //console.log(req.body);

});

app.listen(port, () => {
  console.log(`Charlie's transaction bot is listening for them sweet fees at http://localhost:${port}`)
})
/*
* EXPRESS CRAP
*/

var lastDisplayed = '';

async function txData(parsedData) {

    console.log(parsedData.hash);

    //transaction has internal so we must find the curve swap
    if (parsedData.internalTransactions) {
      parsedData.internalTransactions.forEach((internalTx, i) => {

        pools.forEach((pool, i) => {
          if (internalTx.to.toLowerCase() == pool.address.toLowerCase() && internalTx.input.includes(pool.method)) {
            decodeInput(pool, internalTx.input.slice(10), parsedData)
          }

        });


      });

    } else {
      //this is a straight up swap
      pools.forEach((pool, i) => {
        if (parsedData.to.toLowerCase() == pool.address.toLowerCase() && parsedData.input.includes(pool.method)) {
          decodeInput(pool, parsedData.input.slice(10), parsedData)
        }
      });

    }



}


async function decodeInput(pool, input, parsedData) {
  var res = web3.eth.abi.decodeParameters(['int128','int128','uint256','uint256'], input)
  //console.log(res);
  if (lastDisplayed !== parsedData.hash) {
    lastDisplayed = parsedData.hash;
    var swapVal = new BigNumber(res[2]).div(10 ** pool.tokens[res[0]].decimals).toFixed(2);
    swapVal = parseFloat(swapVal)

    if (pool.type === 'btc') {
      var btc_price = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
      var usdVal =  swapVal * btc_price.data.bitcoin.usd;
      console.log('true btc val ===> ', usdVal);
    } else {
      var usdVal = swapVal;
    }

    var fees = parseFloat(usdVal * 0.0004);



    var llamas = getLlamas(usdVal);
    var llamasTwitter = getTwitterLlamas(usdVal);

    if (pool.type !== 'stable') {
      var message = `${pool.pool} swapped ${swapVal.toLocaleString(undefined, {maximumFractionDigits: 2})} ${pool.tokens[res[0]].name} to ${pool.tokens[res[1]].name} (~$${usdVal.toLocaleString(undefined, {maximumFractionDigits: 2})}) | LP & veCRV Holder Fee: $${fees.toLocaleString(undefined, {maximumFractionDigits: 2})} | Hash https://etherscan.io/tx/${parsedData.hash} | ${llamas}`;
      var messageTwitter = `${pool.pool} swapped ${swapVal.toLocaleString(undefined, {maximumFractionDigits: 2})} $${pool.tokens[res[0]].name} to $${pool.tokens[res[1]].name} (~$${usdVal.toLocaleString(undefined, {maximumFractionDigits: 2})}) | LP & veCRV Holder Fee: $${fees.toLocaleString(undefined, {maximumFractionDigits: 2})} | Hash https://etherscan.io/tx/${parsedData.hash} | ${llamasTwitter}`;
    } else {
      var message = `${pool.pool} swapped ${swapVal.toLocaleString(undefined, {maximumFractionDigits: 2})} ${pool.tokens[res[0]].name} to ${pool.tokens[res[1]].name} | LP & veCRV Holder Fee: $${fees.toLocaleString(undefined, {maximumFractionDigits: 2})} | Hash https://etherscan.io/tx/${parsedData.hash} | ${llamas}`;
      var messageTwitter = `${pool.pool} swapped ${swapVal.toLocaleString(undefined, {maximumFractionDigits: 2})} $${pool.tokens[res[0]].name} to $${pool.tokens[res[1]].name} | LP & veCRV Holder Fee: $${fees.toLocaleString(undefined, {maximumFractionDigits: 2})} | Hash https://etherscan.io/tx/${parsedData.hash} | ${llamasTwitter}`;

    }


    if (usdVal >= 200000) {

      console.log(message);

      clientTwitter.post('statuses/update', {status: messageTwitter}).then((res) => {
      }).catch((err) => {
      })

      if (usdVal >= 800000) {
        bot.telegram.sendMessage(`-1001357982180`, message, {disable_web_page_preview: true}); //<-- test channel
        bot.telegram.sendMessage(`-1001192496860`, message, {disable_web_page_preview: true}); //<-- test channel
      }


    } else {
      console.log('Not showing: ',message);

    }
  }


}



function getTwitterLlamas(swapVal) {
  if (swapVal > 500000) {
    return '🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙';

  }
  if (swapVal > 100000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 50000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 10000) {
    return `🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 1000) {
    return `🦙🦙🦙🦙`;
  }
  if (swapVal > 100) {
    return `🦙🦙`;
  }
  if (swapVal > 1) {
    return `🦙`;
  }
}


function getLlamas(swapVal) {
  if (swapVal > 20000000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 10000000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 5000000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 1000000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 500000) {
    return `🦙🦙🦙🦙🦙🦙🦙🦙`;
  }
  if (swapVal > 300000) {
    return `🦙🦙🦙🦙`;
  }
  if (swapVal > 100) {
    return `🦙🦙`;
  }
  if (swapVal > 1) {
    return `🦙`;
  }
}





const bot = new Telegraf(process.env.telegram_token)

//
// bot.launch().then(() => {});
// client.login(process.env.discord_token);
