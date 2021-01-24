var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/<infura key>`));
const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')

const blockByTime = require('./utils/getBlock')
const BigNumber = require('bignumber.js')
const MOMENT= require( 'moment' );
console.log('________________________________________________________');
console.log('');
console.log('');

let ca_swap ='0x58A3c68e2D3aAf316239c003779F71aCb870Ee47'
let abi = [{"name":"Transfer","inputs":[{"type":"address","name":"sender","indexed":true},{"type":"address","name":"receiver","indexed":true},{"type":"uint256","name":"token_id","indexed":true}],"anonymous":false,"type":"event"},{"name":"Approval","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"approved","indexed":true},{"type":"uint256","name":"token_id","indexed":true}],"anonymous":false,"type":"event"},{"name":"ApprovalForAll","inputs":[{"type":"address","name":"owner","indexed":true},{"type":"address","name":"operator","indexed":true},{"type":"bool","name":"approved","indexed":false}],"anonymous":false,"type":"event"},{"name":"NewSettler","inputs":[{"type":"address","name":"addr","indexed":false}],"anonymous":false,"type":"event"},{"name":"NewSynth","inputs":[{"type":"address","name":"synth","indexed":false},{"type":"address","name":"pool","indexed":false}],"anonymous":false,"type":"event"},{"name":"TokenUpdate","inputs":[{"type":"uint256","name":"token_id","indexed":true},{"type":"address","name":"owner","indexed":true},{"type":"address","name":"synth","indexed":true},{"type":"uint256","name":"underlying_balance","indexed":false}],"anonymous":false,"type":"event"},{"outputs":[],"inputs":[{"type":"address","name":"_settler_implementation"},{"type":"uint256","name":"_settler_count"}],"stateMutability":"nonpayable","type":"constructor"},{"name":"name","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":4579},{"name":"symbol","outputs":[{"type":"string","name":""}],"inputs":[],"stateMutability":"view","type":"function","gas":4609},{"name":"supportsInterface","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"bytes32","name":"_interface_id"}],"stateMutability":"view","type":"function","gas":845},{"name":"balanceOf","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_owner"}],"stateMutability":"view","type":"function","gas":1553},{"name":"ownerOf","outputs":[{"type":"address","name":""}],"inputs":[{"type":"uint256","name":"_token_id"}],"stateMutability":"view","type":"function","gas":1498},{"name":"getApproved","outputs":[{"type":"address","name":""}],"inputs":[{"type":"uint256","name":"_token_id"}],"stateMutability":"view","type":"function","gas":2425},{"name":"isApprovedForAll","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"address","name":"_owner"},{"type":"address","name":"_operator"}],"stateMutability":"view","type":"function","gas":1761},{"name":"transferFrom","outputs":[],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_token_id"}],"stateMutability":"nonpayable","type":"function","gas":134578},{"name":"safeTransferFrom","outputs":[],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_token_id"}],"stateMutability":"nonpayable","type":"function"},{"name":"safeTransferFrom","outputs":[],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_token_id"},{"type":"bytes","name":"_data"}],"stateMutability":"nonpayable","type":"function"},{"name":"approve","outputs":[],"inputs":[{"type":"address","name":"_approved"},{"type":"uint256","name":"_token_id"}],"stateMutability":"nonpayable","type":"function","gas":40888},{"name":"setApprovalForAll","outputs":[],"inputs":[{"type":"address","name":"_operator"},{"type":"bool","name":"_approved"}],"stateMutability":"nonpayable","type":"function","gas":38179},{"name":"get_swap_into_synth_amount","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_synth"},{"type":"uint256","name":"_amount"}],"stateMutability":"view","type":"function","gas":8579},{"name":"get_swap_from_synth_amount","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_synth"},{"type":"address","name":"_to"},{"type":"uint256","name":"_amount"}],"stateMutability":"view","type":"function","gas":4312},{"name":"get_estimated_swap_amount","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_amount"}],"stateMutability":"view","type":"function","gas":12949},{"name":"token_info","outputs":[{"type":"address","name":"owner"},{"type":"address","name":"synth"},{"type":"uint256","name":"underlying_balance"},{"type":"uint256","name":"time_to_settle"}],"inputs":[{"type":"uint256","name":"_token_id"}],"stateMutability":"view","type":"function","gas":8207},{"name":"swap_into_synth","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_synth"},{"type":"uint256","name":"_amount"},{"type":"uint256","name":"_expected"}],"stateMutability":"payable","type":"function"},{"name":"swap_into_synth","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_synth"},{"type":"uint256","name":"_amount"},{"type":"uint256","name":"_expected"},{"type":"address","name":"_receiver"}],"stateMutability":"payable","type":"function"},{"name":"swap_into_synth","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_synth"},{"type":"uint256","name":"_amount"},{"type":"uint256","name":"_expected"},{"type":"address","name":"_receiver"},{"type":"uint256","name":"_existing_token_id"}],"stateMutability":"payable","type":"function"},{"name":"swap_from_synth","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_token_id"},{"type":"address","name":"_to"},{"type":"uint256","name":"_amount"},{"type":"uint256","name":"_expected"}],"stateMutability":"nonpayable","type":"function"},{"name":"swap_from_synth","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_token_id"},{"type":"address","name":"_to"},{"type":"uint256","name":"_amount"},{"type":"uint256","name":"_expected"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"withdraw","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_token_id"},{"type":"uint256","name":"_amount"}],"stateMutability":"nonpayable","type":"function"},{"name":"withdraw","outputs":[{"type":"uint256","name":""}],"inputs":[{"type":"uint256","name":"_token_id"},{"type":"uint256","name":"_amount"},{"type":"address","name":"_receiver"}],"stateMutability":"nonpayable","type":"function"},{"name":"settle","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"uint256","name":"_token_id"}],"stateMutability":"nonpayable","type":"function","gas":42848},{"name":"add_synth","outputs":[],"inputs":[{"type":"address","name":"_synth"},{"type":"address","name":"_pool"}],"stateMutability":"nonpayable","type":"function","gas":605929},{"name":"rebuildCache","outputs":[],"inputs":[],"stateMutability":"nonpayable","type":"function","gas":36338},{"name":"synth_pools","outputs":[{"type":"address","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2086},{"name":"swappable_synth","outputs":[{"type":"address","name":""}],"inputs":[{"type":"address","name":"arg0"}],"stateMutability":"view","type":"function","gas":2116},{"name":"is_settled","outputs":[{"type":"bool","name":""}],"inputs":[{"type":"uint256","name":"arg0"}],"stateMutability":"view","type":"function","gas":2046}]
let minABI = [
  // balanceOf
  {
    "constant":true,
    "inputs":[{"name":"_owner","type":"address"}],
    "name":"balanceOf",
    "outputs":[{"name":"balance","type":"uint256"}],
    "type":"function"
  },
  // decimals
  {
    "constant":true,
    "inputs":[],
    "name":"decimals",
    "outputs":[{"name":"","type":"uint8"}],
    "type":"function"
  },
  {
    "constant":true,
    "inputs":[],
    "name":"symbol",
    "outputs":[{"name":"","type":"string"}],
    "payable":false,
    "stateMutability":"view","type":"function"
  }
];





let eth = ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE']
let btc = ['0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D', '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599']

let totalSwaps = 0;

async function query(start, end, date) {

  let address = `http://api.etherscan.io/api?module=account&action=txlist&address=0x58a3c68e2d3aaf316239c003779f71acb870ee47&startblock=${start}&endblock=${end}&sort=asc&apikey=<etherscan key>`;
  //console.log(address);
  let total = 0;
  let swaps = 0;
  let daily_swaps = []

  let multiplier = 1;
  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd'))
  let txs = await retry(async bail => await axios.get(address))
  if (txs && txs.data.result) {
    await Promise.all( txs.data.result.map(async (tx) => {
        if (tx.input.includes('0x489c7c7c') && tx.isError !== '1') {
          swaps++;
          tx = tx.input;
          tx = tx.replace('0x489c7c7c', '');
          let res = web3.eth.abi.decodeParameters(['address','address','uint256','uint256'], tx)
          let decimals = await returnDecimals(res[0])
          let amount = new BigNumber(res[2]).div(10 ** decimals);
          multiplier = 1;
          //console.log(res[0]);
          if (eth.includes(res[0])) {
            multiplier = price_feed.data.ethereum.usd;
          }
          if (btc.includes(res[0])) {
            multiplier = price_feed.data.bitcoin.usd;
          }
          let swap = multiplier * amount;
          daily_swaps.push(swap)
          total += swap

        }
      })
    )
  }

  let nf = new Intl.NumberFormat();
  totalSwaps += total;
  total = total.toFixed(2);
  let avg = total / swaps

  let maximum = daily_swaps.sort((a, b) => b - a)[0];
  let minimum = daily_swaps.sort((a, b) => a - b)[0];
  console.log(`${date} ==> Total $${nf.format(total)} in ${swaps} swaps | Biggest Swap $${nf.format(maximum)} | Average Swap $${nf.format(avg.toFixed(2))}`);

}


async function main() {
  let snxFees = await getFees();
  let d = new Date();
  let toBlock = null
  let fromBlock = null;
  let days = 8
  d.setHours(24,0,0,0)
  for (var i = 0; i < days; i++) {
    d.setDate(d.getDate() - 1);
    let blockNumber = await getBlock(d)
    fromBlock = toBlock;
    toBlock = blockNumber;
    let ts =  MOMENT(d.getTime()).format( 'YYYY-MM-DD' );
    if (fromBlock) {
      await query(toBlock, fromBlock, ts);
    } else {
      await query(toBlock, 99999999999, ts);
    }

  }
  console.log(' ');
  let nf = new Intl.NumberFormat();
  let average = totalSwaps / days
  console.log(`==============> $${nf.format(totalSwaps)} in ${days} days | Daily Average: $${nf.format(average)}`);
  console.log(`==============> Pending Synthetix Fees: $${nf.format(snxFees.toFixed(2))}`);
  console.log('________________________________________________________');

}

async function getBlock(d) {
  let lastBlock = 0;
  let ts = MOMENT(d.getTime()).format( 'YYYY-MM-DD HH:mm:ss' );
  let fromBlock = await blockByTime(d.getTime() / 1000, d.getTime() / 1000)

  return fromBlock.number;
}


async function getFees() {

    var endpoint = 'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-exchanger'
    var graphQLClient = new GraphQLClient(endpoint)

    var query = gql`
    {
      exchangePartners(first:1, where:{ id:"CURVE" }) {
        usdVolume usdFees id trades
      }
    }
    `;
    const results = await retry(async bail => await graphQLClient.request(query))
    console.log(results);
    return parseFloat(results.exchangePartners[0].usdFees * 0.25);
    //return results.uniswapFactory.totalLiquidityUSD
}


async function returnDecimals(address) {
  if (address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
    return 18;
  }
  let contract = new web3.eth.Contract(minABI, address)
  let decimals = await contract.methods.decimals().call();
  return decimals;
}

main()
