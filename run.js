const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {
  if (msg.content === '.commands') {
    client.channels.cache.get(msg.channel.id).send(`The list of help commands are: `);
  }
  if (msg.content === '.crv') {
    client.channels.cache.get(msg.channel.id).send(`The Curve native token (CRV) has not been released yet. If you wish to find more information about click the following link: https://guides.curve.fi/everything-you-need-to-know-about-crv/`);
  }

});


client.login(process.env.discord_token);
