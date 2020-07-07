const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


let commandList = ['.announcements', '.audit', '.commands', '.contracts', '.crv', '.farming', '.guides', '.risks', '.rules', '.twitter', '.wen', '.when', '.whisper'];

client.on('message', msg => {
  if (msg.content === '.commands') {
    client.channels.cache.get(msg.channel.id).send(`The list of help commands is: ${makeList()}`);
  }
  /*commands*/
  if (msg.content === '.announcements') {
    client.channels.cache.get(msg.channel.id).send(`If you are looking to keep up with Curve news, you can join our Telegram announcement channel: https://t.me/curvefiann`);
  }
  if (msg.content === '.audit') {
    client.channels.cache.get(msg.channel.id).send(`Find details about Curve Finance audits at this address: https://www.curve.fi/audits`);
  }
  if (msg.content === '.contracts') {
    client.channels.cache.get(msg.channel.id).send(`You can read our smart contracts at this address: https://www.curve.fi/contracts`);
  }
  if (msg.content === '.crv' || msg.content === '.when' || msg.content === '.wen') {
    client.channels.cache.get(msg.channel.id).send(`The Curve native token (CRV) has not been released yet. If you wish to find more information about click the following link: https://guides.curve.fi/everything-you-need-to-know-about-crv/`);
  }
  if (msg.content === '.farming') {
    client.channels.cache.get(msg.channel.id).send(`https://i.imgur.com/YPfHjVI.jpg`);
  }
  if (msg.content === '.guides') {
    client.channels.cache.get(msg.channel.id).send(`If you are looking for help to get started with Curve Finance, visit our Guides blog: https://guides.curve.fi/`);
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


});


var makeList = () => {
  var commandListString = '';
  commandList.forEach((item, i) => {
    commandListString += '\r' + item;
  });
  return commandListString;
}

client.login(process.env.discord_token);
