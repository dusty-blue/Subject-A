const { Client, Attachment } = require('discord.js');
const { token } = require('./auth.json');
// const emojiCharacters = require('./emojiCharacters');
const client = new Client();

const { createCanvas, loadImage } = require('canvas');
const Chart = require('chart.js');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! ID is ${client.user.id}`);
});

client.on('message', async msg => {
    if (msg.content.startsWith('!poll')) {
        console.log('saw: ' + msg.content);
        const reactions = msg.content.match(/\d+(?=>)|(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g);
		console.log(reactions);
		const voted = {}
		const filter = (reaction, user) => {
			voted[user.id] = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
            return reactions.includes(reaction.emoji.id) | reactions.includes(reaction.emoji.name); 
		}
        const collector = msg.createReactionCollector(filter, { time:14000});
        collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
        const counts = {};
        collector.on('end', collected => {
            collected.forEach(em => {
				const code = em.emoji.id ? em.emoji.id : em.emoji.name;
				em.users.forEach(usr => {
					if (voted[usr.id] === code && usr.id!= client.user.id) {
						counts[code] = counts[code] ? counts[code] + 1 : 1;
					}
				});
                // counts[code] = em.count - 1;
			});
            console.log(voted);
            const canvas = drawGraph(voted);
            try {
                const attachment = new Attachment(canvas.toBuffer(), 'awesome.png');
                msg.channel.send(printResults(counts), attachment); 
            } catch(e) {
                console.error('Failed to send results with error:\n' + e);
            }
        });
        for (let i = 0; i < reactions.length; i++){
            try {
                await msg.react(reactions[i]);
            } catch(e){
                console.error('Failed to react \n' + e);
            }
        }
    }
});

function compare(a, b){
     if(a[1] < b[1]){
         return 1;
     }
     else if (a[1] > b[1]){
         return -1;
     }
     return 0;
}

function printResults(result){
    const results = Object.entries(result).filter(em => em[1] > 0);
	console.log(results);
    results.sort(compare);
    console.log(results);
    let msgReply = 'Results are: \n';
    results.forEach(entry => {
        const emoji = client.emojis.get(entry[0]) ? client.emojis.get(entry[0]).toString() : entry[0];
        msgReply += emoji + ' : ' + entry[1] + '\n';
    });
    return msgReply;
}

function drawGraph(voted) {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    // Write "Awesome!"
    ctx.font = '30px Impact'
    let gradient = ctx.createLinearGradient(0, 0, 200, 0);
    gradient.addColorStop(0, "magenta");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1.0, "red");
    // Fill with gradient
    ctx.fillStyle = gradient;
    ctx.rotate(0.1);
    ctx.fillText('Awesome!', 50, 100);

    // Draw line under text
    const text = ctx.measureText('Awesome!');
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + text.width, 102);
    ctx.stroke();
    /*
    const fs = require('fs');
    const out = fs.createWriteStream(__dirname + '/test.jpeg');
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('The JPEG file was created.'));
    */
    return canvas;
}

client.login(token);