const config = require('../config.json')
let testChannel

function SendError(from,error){
    console.log(`Error on --${from}--`)
    console.log(error)
    testChannel.send(`Error on --${from}--\n${error}`)
}

function SetTestChannel(){
    const { client } = require('./bot')
    client.channels.fetch(config.testChannelId).then(channels => testChannel = channels)
    .catch(console.error);
}

function GetChannelId(id){
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

function MusicStatus(music){
    const { client } = require('./bot')
	if(music){
		client.user.setActivity(`${music.title}`, { type: 'LISTENING' });
	}
	else{
		client.user.setActivity("");
	}
}

function getPlaylistId(url){
	try{
		const id = new URL(url).searchParams.get('list')
		return id
	}
	catch(err){
		return undefined
	}
}

module.exports = {
    SendError,
    SetTestChannel,
    GetChannelId,
    MusicStatus,
    getPlaylistId
}