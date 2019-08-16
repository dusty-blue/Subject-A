const { Client, Attachment } = require('discord.js')
//const { token } = require('./auth.json');
const token = process.env.TOKEN;
const port = process.env.PORT;
console.log(`This is port ${ port }.... not really `);

// const emojiCharacters = require('./emojiCharacters');
const client = new Client();

const { createCanvas, loadImage } = require('canvas');
const Chart = require('node-chartjs');

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
            if (reaction.emoji.name == '⏹') {
                return false;
            }
            voted[user.id] = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
            console.log(voted);
            return reactions.includes(reaction.emoji.id) | reactions.includes(reaction.emoji.name) ;
            /*if (user.id != client.user.id) {
                voted[user.id] = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
                return reactions.includes(reaction.emoji.id) | reactions.includes(reaction.emoji.name);
            } else {
                return false;
            }*/
		}
        const collector = msg.createReactionCollector(filter, { time: 10000 }); //600000
        collector.on('collect', r => console.log(`Collected ${r.emoji.name}`));
        const counts = {};
        collector.on('end', async collected => {
            console.log('in end event');
            console.log(collected);
            collected.forEach(em => {
				const code = em.emoji.id ? em.emoji.id : em.emoji.name;
                em.users.forEach(usr => {
                    if (voted[usr.id] === code && usr.id != client.user.id) {
						counts[code] = counts[code] ? counts[code] + 1 : 1;
					}
				});
            });

            console.log(voted);
            const graph = await drawGraph(counts);
            try {
                const buffer = await graph.toBuffer('image/png');
                const attachment = new Attachment(buffer, 'awesome.png');
                msg.channel.send(printResults(counts), attachment); 
            } catch(e) {
                console.error('Failed to send results with error:\n' + e);
            }
            endCollector.stop();
        });
        const endFilter = (reaction,user) => {
            return reaction.emoji.name == '⏹' && user.id == msg.author.id; //client.emojis.first().name; 
        }
        
        const endCollector = msg.createReactionCollector(endFilter, { time: 1800000 });
        endCollector.on('collect', () => {
            console.log('found stop');
            console.log(collector.collected);
            collector.stop();
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

 async function drawGraph(voted) {
    const chart = new Chart(200, 200);
    const chartJsOptions = {
        type: 'doughnut',
        data: {
            datasets: [{
                label: '# of Votes',
                // data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: 'white',
                    fontSize: 16
                }
            }
        }
     };
     chartJsOptions.data.datasets[0].data = Object.values(voted);
     let emNames = [];
     const labels = Object.keys(voted);
     labels.forEach(entry => {
         const emoji = client.emojis.get(entry) ? client.emojis.get(entry).name : entry;
         emNames.push(emoji);
     });
     chartJsOptions.data.labels = emNames; // use canvas to insert on images?

     
     try {
         await chart.makeChart(chartJsOptions);
         await chart.drawChart();
         await chart.toFile('test_image.png');
     }
     catch (e) {
         console.error("Failed to create chart with error : \n" + e);
     }
     return chart;
}

client.login(token).catch(e => console.error("Failed login " + e));

