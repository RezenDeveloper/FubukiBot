import Discord, { VoiceChannel } from 'discord.js'
import { getConfig, hasCommands } from './utils/utils'
import { useTextCommands } from './commands/useTextCommands'
import { useVoiceCommands } from './commands/useVoiceCommands'

export let data:Iconfig
export let CurrentVoiceChannel:VoiceChannel
const client = new Discord.Client()
const { TOKEN } = process.env;

process.on('unhandledRejection', error => {
	console.error('Uncaught Promise Rejection', error)
});

client.once('ready', async () => {
    data = await getConfig()
    console.log('Ready!');
});

client.on('message', async message => {
    const { content } = message
    const { prefix, textCommands, voiceCommands } = data 

    if(content.charAt(0) === prefix){

        let command = hasCommands(textCommands, content, prefix)
        if(command){
            await useTextCommands(message, command)
        }
        else{
            command = hasCommands(voiceCommands, content, prefix)
            if(command) useVoiceCommands(message, command)
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    console.log('voice update!')
});

client.login(TOKEN);