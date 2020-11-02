const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();
const { OpusEncoder } = require('@discordjs/opus');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');
const Pagination = require('discord-paginationembed');

var MongoClient = require('mongodb').MongoClient;

config.mongo_url = process.env.DATABASE_URL;
config.token = process.env.TOKEN;

let nickname="", reply="", name_status="", search_global="", voice_global=null;
let search_waiting=false, last_song = false, offline = false, paused_global=false;
let queue_number = 0, queue_tamanho = 0;
let queue_global = [];
let time = {current:0,total:0};
const botId = config.botId;
let testChannel;
let dispatcher = undefined;
/*

-----------------------------------------------------------------
Biblioteca: https://discord.js.org/#/
Guias: https://discordjs.guide/ e https://anidiots.guide/

ATUALIZAÇÕES

aumentar o tempo do status
Adicionar comando /addfirst - adiciona a musica na primeira posição
Adicionar comando /addnext - adiciona a musica na próssima posição
Tocar recomendados se for a última musica da queue
/addplaylist - adiciona a playlist selecionada na queue
/addplaylistbanco - adiciona uma playlist no banco de dados
/time xx:xx:xx - seleciona o tempo do video

BUGS


CONCLUIDOS

-------------------------------------------------------------------
*/

//Events
process.on('unhandledRejection', error => {
	console.error('Uncaught Promise Rejection', error)
});
client.login(config.token);

client.once('ready', () => {
	console.log('Ready! ');
	client.channels.fetch(config.testChannelId)
		.then(channel => {
			testChannel = channel;
		})
		.catch(console.error);
	if(process.env.OFFLINE == "true"){
		config.prefix = "/";
		console.log("Running local");
		client.channels.fetch(config.testVoiceChannelId)
			.then(channel => {
				voice_global = channel;
			})
			.catch(console.error);
		offline = true; 
	}
});

client.on('message', async message => {
	CheckName(message.author.username,message.author.discriminator);
	Comandos(message);

	let voiceCommand = message.content.toLowerCase().split(' ')[0].split('').slice(1).join('') 
	let prefix = message.content.toLowerCase().split(' ')[0].split('')[0]
	if((config.voiceCommands.includes(voiceCommand) && prefix === config.prefix) || search_waiting){
		voiceCommand = message.content.toLowerCase().split(' ')[0];
	}
	else{
		voiceCommand = false
	}
	if(voiceCommand){
		Voice(message,voiceCommand);
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	const cache = newState.guild.voiceStates.cache;
	const voiceUsers = cache.map( (value,index) => {
		if(value.channel){
			return value.id;
		}
	}).filter((value) => {
		return value !== undefined;
	})
	//console.log(voiceUsers);
	//console.log(voiceUsers.length);
	if(voiceUsers.length === 1 && voiceUsers[0] === botId && !offline){
		Leave(voice_global);
	}
});

//Message
async function Comandos(msg){
	
	Fubuki_Adm(msg);

	//Help
	if (msg.content.toLowerCase() == config.prefix+'help') {
		const HelpEmbed = new Discord.MessageEmbed();
		HelpEmbed.setColor("#0099ff");
		HelpEmbed.setTitle("Help");
		HelpEmbed.setDescription("Here is my command list:");
		HelpEmbed.addFields(
			{ name: "Chat Commands", value: "**"+config.prefix+"help** - You are already using it! \n"+
											"**"+config.prefix+"avatar** - Show your avatar! \n"+
											"**"+config.prefix+"ohayo** - It is what it is \n"+
											"**"+config.prefix+"oyasumi** - :zzz: \n"+
											"**"+config.prefix+"RandomFubuki** - Give you a random Fubuki's Shitpost! \n"+
											"**"+config.prefix+"yare** - Just do it! \n"+
											"**"+config.prefix+"d5** - Roll the D5 \n"+
											"**"+config.prefix+"d20** - Roll the D20 \n"+
											"**"+config.prefix+"d100** - Roll the D100", inline: true },
			{ name: 'Voice Commands', value: "**"+config.prefix+"play (url/name)** - I will sing it for you! \n"+
											 "**"+config.prefix+"pause** - Toki wo Tomare!\n"+
											 "**"+config.prefix+"PlayPlaylist (name)** - Play a playlist from my database\n"+
											 "**"+config.prefix+"leave** - I will leave the voice \n"+
											 "**"+config.prefix+"next** - Next song of the playlist/queue \n"+
											 "**"+config.prefix+"previous** - Previous song of the playlist/queue\n"+
											 "**"+config.prefix+"shuffle** - Shuffle the playlist/queue\n"+
											 "**"+config.prefix+"search (name)** - Search some musics!\n"+
											 "**"+config.prefix+"queue** - Show the current playing songs!\n"+
											 "**"+config.prefix+"queue (number)** - Play the specific playlist song\n"+
											 "**"+config.prefix+"clear** - Clear the current playing queue\n"+
											 "**"+config.prefix+"add url/name** - Add a song to the end of the queue\n", inline: true },
		)
		msg.channel.send(HelpEmbed);
	}
	//Ohayo
	if (msg.content.toLowerCase() == config.prefix+'ohayo') {
	
		msg.channel.send('> Ohayo Gozaimasu '+nickname+'!');

	}
	//Oyasumi
	if (msg.content.toLowerCase() == config.prefix+'oyasumi') {
	
		msg.channel.send('> Oyasuminasai '+nickname+' :zzz:');
	}
	//RandomFubuki
	if (msg.content.toLowerCase() == config.prefix+'randomfubuki' || msg.content.toLowerCase() == config.prefix+'rf') {
		var result = await MongoSelect({},"randomfubuki",{_id: 0});
		
		var idurl = Math.floor(Math.random()*result.length);
		console.log("Music: "+result[idurl].name);
		msg.channel.send("Here's your random Fubuki Shitpost "+ nickname +" \n"+result[idurl].url);
	}
	//YARE!!
	if (msg.content.toLowerCase() == config.prefix+'yare') {
	
		msg.channel.send('https://www.youtube.com/watch?v=GGphvPYRHQs');

	}
	//Avatar
	if(msg.content.toLowerCase() == config.prefix+'avatar'){

		const AvatarEmbed = new Discord.MessageEmbed();
		var url = msg.author.avatarURL().split('.webp')[0]+".png?size=1024";
		AvatarEmbed.setImage(url);
		msg.channel.send(AvatarEmbed);

	}
	//d5
	if(msg.content.toLowerCase() == config.prefix+'d5'){

		var dice = Math.floor(Math.random()*(5)+1);
		msg.channel.send(dice);

	}
	//d20
	if(msg.content.toLowerCase() == config.prefix+'d20'){

		var dice = Math.floor(Math.random()*(20)+1);
		if(dice==1){
			msg.channel.send("Uhh... "+dice);
		}
		else{
			if(dice==20){
				msg.channel.send(dice+"! おめでとう!!");
			}
			else{
				msg.channel.send(dice);
			}
		}
	}
	//d100
	if(msg.content.toLowerCase() == config.prefix+'d100'){

		var dice = Math.floor(Math.random()*(100)+1);
		if(dice==1){
			msg.channel.send(dice+" :TanjiroHMMWTF:");
		}
		else{
			if(dice==100){
				msg.channel.send(dice+"! すごい!!");
			}
			else{
				msg.channel.send(dice);
			}
		}
	}
	//unsee
	if(msg.content.toLowerCase() == config.prefix+'unsee'){
	
		msg.channel.send("I'm not a god, sorry");

	}
	//playplaylist
	if (msg.content.split(' ')[0].toLowerCase() == config.prefix+'playplaylist' || msg.content.split(' ')[0].toLowerCase() == config.prefix+'pp') {

		const music = msg.content.split(' ')[1].toLowerCase();
		MongoSelect({name: music},"playlists",{_id: 0,url: 1}).then(result => {
			const fakemessage = msg;
			fakemessage.content = config.prefix+"play "+result[0].url;
			Voice(fakemessage,config.prefix+"play");
		}).catch(error => {
			msg.channel.send("Sorry, i couldn't find this playlist on my database");
			console.log(error);
		})
	}
}
function Fubuki_Adm(msg){
	if(reply==2 && msg.author.discriminator == "2722"){

		client.user.setActivity(msg.content, { type: name_status.toUpperCase() });
		msg.reply("Done!");
		
		reply = 0;
	}
	if(reply==1 && msg.author.discriminator == "2722"){
		
		if(msg.content.toLowerCase()=="watching"){
			status = 1;
			name_status="watching";
		}
		if(msg.content.toLowerCase()=="listening"){
			status = 2;
			name_status="listening";
		}
		if(msg.content.toLowerCase()=="playing"){
			status = 3;
			name_status="playing";
		}
		msg.reply("What i will be "+name_status+"?");
		reply=2;
	}
	//Set status!!
	if (msg.content.toLowerCase() == config.prefix+'status') {
	
		if(msg.author.id=="373885546113662977"){
			msg.reply("Please choose the activity:\n**Watching**\n**Listening**\n**Playing**");
			reply = 1;
		}
		else{
			msg.reply("You don't have the authority for this, baka!");
		}
	}
	//Clear status
	if (msg.content.toLowerCase() == config.prefix+'clearstatus' || msg.content.toLowerCase() == config.prefix+'cs') {
	
		if(msg.author.id=="373885546113662977"){
			client.user.setActivity("");
			msg.reply("Done!");
		}
		else{
			msg.reply("You don't have the authority for this, baka!");
		}
	}
	//Send message
	if(msg.content.toLowerCase().split(' ')[0] == config.prefix+'sendmessage'){
		if(msg.author.id=="373885546113662977"){
			if(!msg.content.split(' ')[1] || !msg.content.split(' ')[2]){
				msg.channel.send("Wrong sentence. Try "+config.prefix+"sendmessage (ID) (message)");
				return;
			}
			var send_msg = msg.content.split(' ')[2];
			var channel_id = msg.content.split(' ')[1];
			try{
				channel_id = GetId(channel_id);
				const chan = client.channels.cache.get(channel_id);
				chan.send(send_msg);
				msg.channel.send('Done!');
				
			}
			catch(error){
				msg.channel.send("Sorry, i could not find this channel ID");
			}
			
		}
		else{
			msg.reply("You don't have the authority for this, baka!");
		}
	}
	//Delete message
	if(msg.content.toLowerCase().split(' ')[0] == config.prefix+'deletemessage'){
		if(msg.author.id=="373885546113662977" || !msg.content.split(' ')[2]){
			if(!msg.content.split(' ')[1] || !msg.content.split(' ')[2]){
				msg.channel.send("Wrong sentence. Try "+config.prefix+"deletemessage (ID) (Channel)");
				return;
			}
			var msg_id = msg.content.split(' ')[1];
			var channel_id = msg.content.split(' ')[2];
			channel_id = GetId(channel_id);
			try{
				const chan = client.channels.cache.get(channel_id);
				var deleted = false;
				for(var cont = 0;cont<chan.messages.cache.size;cont++){
					//console.log('ID '+cont+" "+chan.messages.cache.array()[cont].id+" ID digitado: "+msg_id);
					if(chan.messages.cache.array()[cont].id == msg_id){
						try{
							chan.messages.cache.array()[cont].delete();
							var deleted = true;
						}
						catch(error){
							console.log(error);
						}
					}
				}
				if(deleted == true){
					msg.channel.send("Message Deleted!");
				}
				else{
					msg.channel.send("I could not find this message ID");
				}
			}
			catch(err){
				msg.channel.send("Sorry, i could not find this channel ID ");
				console.log(err);
			}
		}
		else{
			msg.reply("You don't have the authority for this, baka!");
		}
	}
	//Offline
	if(msg.content.toLowerCase().split(' ')[0] == config.prefix+'setoffline'){
		if(msg.author.id=="373885546113662977"){
			if(!offline){
				msg.channel.send("Back to online!");
				offline = false;
			}
			else{
				msg.channel.send("Now running offline!");
				offline = true;
			}
		}
	}
}
function CheckName(author,tag){

	if(author.toLowerCase().includes("-san")||author.toLowerCase().includes("-kun")||author.toLowerCase().includes("-sama")){
		nickname = author;
		//Se o autor tiver san/kun/sama no nick
	}
	else{
		nickname = author+"-san";
		//Se o autor não tiver, adiciona '-san'.
	}
	if(tag=="1515"){
		nickname = "Cepola-san";
	}
	if(tag=="2385"){
		nickname = "Fritão-san";
	}
	if(tag=="2722"){
		nickname = "Willis-sama";
	}
	if(tag=="1051"){
		nickname = "Dêk-san";
	}

}

//Voice
async function Voice(msg,command){
	if(msg.channel.type == 'dm'){
		//Verifica se a mensagem é uma DM
		return;
	};

	// Verifica o voice channel de quem mandou a mensagem
	let voiceChannel = msg.member.voice.channel;

	voiceChannel = voiceChannel === null ? voice_global : voiceChannel;
	if (voiceChannel === null) {
		msg.reply('Please join a voice channel first '+nickname+'!');
		return;
	}

	//console.log(voiceChannel)

	//Play
	if(command === config.prefix+'play'){

		const url = msg.content.split(' ')[1];
		//console.log("mensagem: "+message.content+"\ncomando: "+message.content.toLowerCase().split(' ')[0]+"\nurl: "+url);

		//Playlist
		if(ytpl.validateID(url)==true){
			if(url.split('index=')[1]){
				var index = new URL(url).searchParams.get('index');
				queue_number = index;
			}
			else{
				queue_number = 1;
			}	
			AddPlaylist(url).then(playlist => {
				queue_global = playlist.items
				msg.channel.send("Playing the playlist **"+playlist.title+"**");
				define_musica(voiceChannel,0);
			}).catch(err => console.log(err));
			
		}
		//Video
		else{
			if(ytdl.validateURL(url)==true){
				AddMusic(url).then(queue => {
					queue_global[0] = queue
					define_musica(voiceChannel,0);
				}).catch(err => console.log(err))
			}
			else{
				const name = msg.content.replace(msg.content.split(' ')[0],'');
				Search_Video(name,1).then(queue => {
					const video = queue[0]
					queue_global[0] = video
					define_musica(voiceChannel,0);
					msg.channel.send("Playing: **"+video.title+"**");
				}).catch(err => console.log(err));
			}
			queue_number = 1;
		}
	}
	//Search
	if(command === config.prefix+'search'){
		const search = msg.content.replace(msg.content.split(' ')[0],'');
		Search_Video(search,20).then(searchResults => {
			search_global = searchResults
			//console.log(searchResults.items);
			const SearchEmbed = new Pagination.FieldsEmbed()
			SearchEmbed.embed.setColor("#0099ff");
			SearchEmbed.embed.setTitle("Search Results:");
			SearchEmbed.setChannel(msg.channel);
			SearchEmbed.setElementsPerPage(10);
			SearchEmbed.setAuthorizedUsers([]);
			var array = [];
			array.length = searchResults.length;
			for(count=0;count<array.length;count++){
				array[count] = count;
			}
			SearchEmbed.setArray(array);
			SearchEmbed.formatField('Musics', (i) => {
				const time = searchResults[i].seconds;
				const minutes = Math.floor(time/60) > 1? Math.floor(time/60):"00";
				const seconds = time-(Math.floor(time/60)*60);
				const hours = Math.floor(time / 3600) > 1? Math.floor(time / 3600) : "00";

				return `**Song ${(i+1)}** ${searchResults[i].title} **${hours}:${minutes}:${seconds}**`
			});
			SearchEmbed.setDisabledNavigationEmojis(['delete','jump']);
			SearchEmbed.build();	
			SearchEmbed.setTimeout(0);
			search_waiting = true;
			msg.channel.send("Digite the song number, " + nickname);
		}).catch(err => console.log(err));
	}
	//Search Result
	if(search_waiting === true && parseInt(msg.content) > 0){
		const number = (msg.content-1);
		const searchUrl = search_global[number].url;
		const searchTitle = search_global[number].title;
		const searchSeconds = search_global[number].seconds;
		queue_global[0] = {title:searchTitle,url:searchUrl,seconds:searchSeconds}
		queue_number = 1;
		define_musica(voiceChannel,0);
		msg.channel.send("Playing the song: "+search_global[number].title);
		search_waiting = false;
	}
	//Leave
	if(msg.content.toLowerCase() === config.prefix+'leave'){
		Leave(voiceChannel);
	}
	//Next
	if(msg.content.toLowerCase() === config.prefix+'next'){
		queue_tamanho = queue_global.length
		if(queue_number < queue_tamanho){
			queue_number++;
			define_musica(voiceChannel,0);
			msg.channel.send("Next song!");
			CurrentPlayingEmbed(msg.channel,queue_global[(queue_number-1)],queue_number);
		}
		else{
			msg.channel.send("This is the last song");
		}
		//console.log("tamanho: "+queue_tamanho+"  number: "+queue_number);
	}
	//Previous
	if(msg.content.toLowerCase() === config.prefix+'previous'){
		queue_tamanho = queue_global.length
		if(queue_number > 1){
			queue_number--;
			define_musica(voiceChannel,0);
			msg.channel.send("Previous song!");
			CurrentPlayingEmbed(msg.channel,queue_global[(queue_number-1)],queue_number);
		}
		else{
			msg.channel.send("This is the first song");
		}
		//console.log("tamanho: "+queue_tamanho+"  number: "+queue_number);
	}
	//Queue
	if(command === config.prefix+'queue'){
		//console.log(queue_global.length)
		if(queue_global.length === 0){
			msg.channel.send("There's no queue to show");
			return;
		}
		var number = msg.content.split(' ')[1];

		if(number == undefined){
			//console.log(queue_global)
			const FieldsEmbed = new Pagination.FieldsEmbed()
			FieldsEmbed.embed.setColor("#0099ff");
			FieldsEmbed.embed.setTitle("Current Queue");
			FieldsEmbed.setChannel(msg.channel);
			FieldsEmbed.setElementsPerPage(10);
			FieldsEmbed.setAuthorizedUsers([]);
			const array = queue_global.map((_,index) => {
				return index
			})
			FieldsEmbed.setArray(array);
			FieldsEmbed.formatField('Musics', i => "**Song "+ (i+1) +"** -- "+queue_global[i].title);
			FieldsEmbed.setDisabledNavigationEmojis(['delete','jump']);
			FieldsEmbed.setTimeout(0);	
			FieldsEmbed.build();

			const index = queue_number;
			const video = queue_global[(queue_number-1)];
		
			CurrentPlayingEmbed(msg.channel,video,index);
		}
		else{
			if(number <= queue_tamanho && number>0){
				queue_number = number;
				const video = queue_global[(queue_number-1)];
				define_musica(voiceChannel,0);
				CurrentPlayingEmbed(msg.channel,video,queue_number);
			}
			else{
				msg.channel.send("Give me a valid number");
			}
		}
	}
	//Add
	if(command === config.prefix+'add'){
		const url = msg.content.split(' ')[1];
		if(!ytpl.validateID(url)){
			//Video
			if(ytdl.validateURL(url)){
				AddMusic(url).then(queue => {
					queue_global.push(queue);
					msg.channel.send("Added: **"+queue.title+"** to the queue");
					if(queue_global.length==1){
						queue_number = 1;
						define_musica(voiceChannel,0);
					}
					if(last_song == true){
						queue_number++;
						define_musica(voiceChannel,0);
						last_song = false;
					}
				}).catch(err => console.log(err))				
			}
			else{
			//Search
				const search = msg.content.replace(msg.content.split(' ')[0],'');
				Search_Video(search,1).then(queue => {
					const video = queue[0];
					queue_global.push(video);
					msg.channel.send("Added: **"+video.title+"** to the queue");
					if(queue_global.length==1){
						queue_number = 1;
						define_musica(voiceChannel,0);
					}
					if(last_song == true){
						queue_number++;
						define_musica(voiceChannel,0);
						last_song = false;
					}
				}).catch(err => console.log(err))
			}
		}
		else{
			//Playlist
			AddPlaylist(url).then(({items,title}) => {
				Array.prototype.push.apply(queue_global,items)
				const listsize = queue_global.length
				msg.channel.send("Added the playlist: **"+title+"** to the queue");
				if(queue_global.length == listsize){
					queue_number = 1;
					define_musica(voiceChannel,0);
				}
				if(last_song == true){
					queue_number++;
					define_musica(voiceChannel,0);
					last_song = false;
				}
			}).catch(err => console.log(err))
		}
		
	}
	//Clear
	if(command === config.prefix+'clear'){
		if(queue_tamanho==0){
			msg.channel.send("There is no queue to clear!");
			return;
		}
		if(dispatcher !== undefined){
			dispatcher.destroy()
			dispatcher = undefined;
		}
		queue_number = 0;
		queue_tamanho = 0;
		queue_global = [];
		msg.channel.send("Queue cleaned!");
	}
	//Shuffle
	if(command === config.prefix+'shuffle'){
		if(queue_global.length === 0){
			msg.channel.send("I can't shuffle nothing!");
			return;
		}
		if(queue_global.length === 1){
			msg.channel.send("I can't shuffle one video!");
			return;
		}
		let randomQueue = queue_global
			.map((a,i) => ({sort: Math.random(), value: a}))
			.sort((a, b) => a.sort - b.sort)
			.map((a) => {
				return a.value
			})
		queue_global = randomQueue;
		define_musica(voiceChannel,0);
		msg.channel.send("Shuffled!");
	}
	//Pause
	if(command === config.prefix+'pause'){
		if(dispatcher !== undefined){
			if(!paused_global){
				msg.channel.send("<:Menacing:603270364314730526> Menacing: Toki wo Tomare! <:Menacing:603270364314730526>");
				paused_global = true
				dispatcher.pause();
			}
			else{
				msg.channel.send("<:Menacing:603270364314730526> Toki wa ugoki dasu! <:Menacing:603270364314730526>");
				paused_global = false;
				dispatcher.resume()
			}
		}
		else{
			msg.channel.send('Nothing to pause')
		}
	}
}
function define_musica(voiceChannel,pause){
	voice_global = voiceChannel;
	queue_tamanho = queue_global.length;
	let Dispatchertime = 0;
	//console.log("index: "+(queue_number-1));
	const music = queue_global[(queue_number-1)];
	//console.log(queue_global)
	
	voiceChannel.join().then(connection => {
		const stream = ytdl(music.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25});
		
		dispatcher = connection.play(stream)

		dispatcher.on('start',() => {
			MusicStatus(music,pause)
		})
		dispatcher.on('finish',() => {
			//console.log('number: '+queue_number+" tamanho "+queue_tamanho);
			if(queue_number < queue_global.length){
				queue_number = queue_number+1;
				define_musica(voiceChannel,0);
			}
			else{
				last_song = true;
			}
		})
		dispatcher.on('error',(err) => { 
			console.log('---DISPATCHER ERROR---\n'+err);
			testChannel.send('---DISPATCHER ERROR---\n'+err)
		})
	}).catch((er) => {
		console.log(er)
		testChannel.send('---CONNECTION ERROR---\n'+err)
	});
}
function Leave(voice){
	try{
		if(queue_global.length > 0){
			define_musica(voice,1);
		}
		voice_global.leave();
	}
	catch(error){
		console.log("------ ERRO NO LEAVE ------")
		testChannel.send("------ ERRO NO LEAVE ------")
		console.log(error);
	}
}
function CurrentPlayingEmbed(channel,video,index){
	const CurrentPlayingEmbed = new Discord.MessageEmbed();
	CurrentPlayingEmbed.setColor("#0099ff");
	CurrentPlayingEmbed.setTitle("Current Playing Song "+index);
	CurrentPlayingEmbed.setDescription(video.title);
	CurrentPlayingEmbed.setImage(video.image);
	channel.send(CurrentPlayingEmbed);
}

//Functions
function GetId(id){
	var channel_id = id;
	if(id.toLowerCase() == "massagens"){
		channel_id = "455914991552561154";
	}
	if(id.toLowerCase() == "memes"){
		channel_id = "700872324626382848";
	}
	if(id.toLowerCase() == "weeb_shit"){
		channel_id = "700872385561100489";
	}
	if(id.toLowerCase() == "teste"){
		channel_id = "708082957524664384";
	}
	//console.log(channel_id);
	return channel_id;
}
function ToSeconds(time){
	return parseFloat(time.split(':')[0])*60 + parseFloat(time.split(':')[1])
}
function MusicStatus(music,pause,time){
	if(pause === 0){
		client.user.setActivity(`${music.title}`, { type: 'LISTENING' });
	}
	else{
		client.user.setActivity("");
	}
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

//Requests
function MongoSelect(query,collection,projection_received){

	return new Promise(result => {
		setTimeout(() => {
			const client = new MongoClient(config.mongo_url, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {
				var dbo = client.db("fubukibot");
				dbo.collection(collection).find(query,{projection:projection_received}).toArray(function(error,data){
					if(error) throw error;
					result(data);
				});
			});
		}, 1000);
	});
}
function AddMusic(url){
	return ytdl.getBasicInfo(url).then(({videoDetails}) => {
		const {title,video_url,lengthSeconds,thumbnail} = videoDetails
		const image = thumbnail.thumbnails[3].url

		return {title:title,url:video_url,seconds:lengthSeconds,image:image}
	}).catch(err => {
		console.log("--Erro no AddMusic--\n"+err)
		testChannel.send("--Erro no AddMusic--\n"+err)
	});
}
function AddPlaylist(url){
	return ytpl(url).then(({items,title}) => {
		return{
			title: title,
			items: items.map(({title,url_simple,duration,thumbnail}) => {
				const seconds = ToSeconds(duration)
				return {title:title,url:url_simple,seconds:seconds,image:thumbnail}
			})
		}
	}).catch(err => {
		console.log("--Erro no AddPlaylist--\n"+err)
		testChannel.send("--Erro no AddPlaylist--\n"+err)
	})
}
function Search_Video(name,limit){
	return ytsr.getFilters(name).then((filters1) => {
		const filter1 = filters1.get('Type').find(o => o.name === 'Video');
		const options = {
			limit: limit,
			nextpageRef: filter1.ref,
		}
		return ytsr(null, options).then(({items}) => {
			return items.map(value => {
				const seconds = ToSeconds(value.duration)
				return {title:value.title,url:value.link,seconds:seconds,image:value.thumbnail}
			})
		});
	}).catch(err => {
		console.error("--Erro no Search--\n"+err);
		testChannel.send("--Erro no Search--\n"+err)
	});
}