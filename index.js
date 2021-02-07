require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require("axios");
const retry = require('async-retry')


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


let commandList = ['.announcements', '.audit', '.commands', '.contracts', '.crv', '.farming', '.guides','.market', '.now', '.risks', '.rules', '.twitter', '.when', '.wen', '.whisper', ];

client.on('message', async msg => {
  if (msg.content === '.commands') {
    client.channels.cache.get(msg.channel.id).send(`The list of help commands is: ${makeList()}`);
  }
  /*commands*/
  if (msg.content === '.announcements') {
    client.channels.cache.get(msg.channel.id).send(`If you are looking to keep up with Curve news, you can join our Telegram announcement channel: https://t.me/curvefiann\rFeel free to subscribe to our blog too: https://news.curve.fi/`);
  }
  if (msg.content === '.audit') {
    client.channels.cache.get(msg.channel.id).send(`Find details about Curve Finance audits at this address: https://www.curve.fi/audits`);
  }
  if (msg.content === '.contracts' || msg.content == '!contracts' || msg.content == '!Contracts' || msg.content == '!contract') {
    client.channels.cache.get(msg.channel.id).send(`You can read our smart contracts at this address: https://www.curve.fi/contracts`);
  }
  if (msg.content === '.crv' || msg.content === '.when' || msg.content === '.wen' || msg.content === '.now') {
    client.channels.cache.get(msg.channel.id).send(`Now: https://resources.curve.fi/base-features/understanding-crv`);
  }
  if (msg.content === '.farming') {
    client.channels.cache.get(msg.channel.id).send(`https://i.imgur.com/YPfHjVI.jpg`);
  }
  if (msg.content === '.guides') {
    client.channels.cache.get(msg.channel.id).send(`If you are looking for help to get started with Curve Finance, visit our Guides blog: https://resources.curve.fi/`);
  }
  if (msg.content === '.risks') {
    client.channels.cache.get(msg.channel.id).send(`It's important to understand the risks associated with providing liquidity on Curve Finance https://www.curve.fi/risks`);
  }
  if (msg.content === '.rules') {
    client.channels.cache.get(msg.channel.id).send(`Be respectful and don't shill`);
  }
  if (msg.content === '.twitter') {
    client.channels.cache.get(msg.channel.id).send(`Follow Curve Finance on Twitter https://twitter.com/CurveFinance`);
  }
  if (msg.content === '.whisper') {
    client.channels.cache.get(msg.channel.id).send(`https://i.imgur.com/skgQJ3K.jpg`);
  }
  if (msg.content === '.market') {
        const options = {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
        };
        let binanceusdt = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=CRVUSDT'))
        let binancebtc = await retry(async bail => await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=CRVBTC'))
        let response = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=curve-dao-token&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
        if(client.channels.cache.get(msg.channel.id) == 735144456914731098){
            client.channels.cache.get(msg.channel.id).send(`\`\`\`c\rPrice: $${binanceusdt.data['price']} | ₿${binancebtc.data['price']}\r24H Volume: $${Number(response.data['curve-dao-token'].usd_24h_vol).toLocaleString('en', options)}\r24H Change: ${response.data['curve-dao-token'].usd_24h_change.toFixed(2)} %\`\`\``);
        }
  }


});


var makeList = () => {
  var commandListString = '';
  commandList.forEach((item, i) => {
    commandListString += '\r' + item;
  });
  return commandListString;
}

client.login(process.env.discord_token);
