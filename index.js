const Discord = require('discord.js');
var auth =require('./auth.json');
const client = new Discord.Client({
	token:auth.token
});


client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('message', msg => {
 if (msg.content === 'ping') {
 msg.reply('pong');
 }
 else if(msg.content.startsWith('!poll')){
	 console.log('saw: ' + msg.content);
	 var reactions= msg.content.match(/\:\w*\:/g);
	 console.log(reactions);
	 for (var i=0; i< reactions.length; i++){
		 msg.reply('+ ' + reactions[i]);
	 }
 }
});

client.login(auth.token);