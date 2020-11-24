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

module.exports = {
    SendError,
    SetTestChannel
}