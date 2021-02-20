import Discord from 'discord.js'
import { getNickname, hasCommands } from './utils/utils'
import { useTextCommands } from './commands/useTextCommands'
import { useVoiceCommands, searchWaiting } from './commands/useVoiceCommands'
import { config, searchObj } from './commands/commandClasses';

export const client = new Discord.Client()
const { TOKEN } = process.env;

client.login(TOKEN);

client.once('ready', async () => {
    console.log('Ready!');
});

client.on('message', async message => {
    const { content, channel, author } = message
    const configData = await config.getConfig()
    const { prefix, textCommands, voiceCommands } = configData
    
    if(searchObj.getWaiting){
        await searchWaiting(message)
    }
    else if(content.charAt(0) === prefix){
        let command = hasCommands(textCommands, content, prefix, (message) => {
            channel.send(message)
        })
        if(command){
            await useTextCommands(message, command as Icommand)
            return
        }

        command = hasCommands(voiceCommands, content, prefix, (message) => {
            channel.send(message)
        })
        
        if(command && channel.type === "text") {
            await useVoiceCommands(message, command as IcommandVoice)
        }
        else if(command && channel.type !== "text") {
            channel.send(`Sorry ${await getNickname(author)}, i can't do that on this channel.`)
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    
});