import Discord, {Message} from 'discord.js'
import { getNickname, hasCommands } from './utils/utils'
import { useTextCommands } from './commands/useTextCommands'
import { useVoiceCommands, searchWaiting } from './commands/useVoiceCommands'
import { useAdminCommands } from './commands/useAdminCommands'
import { config, searchObj } from './commands/commandClasses';
import { getIdData } from './utils/api/pixiv';
import { handlePixivUrl } from './commands/text/pixivUrl';

export const client = new Discord.Client()
const { TOKEN } = process.env;

client.login(TOKEN);

client.once('ready', async () => {
    console.log('Ready!');
});

client.on('message', async message => {
    const configData = await config.getConfig

    if(searchObj.getWaiting){
        await searchWaiting(message)
        return
    }
    else if(message.content.charAt(0) === configData.prefix){
        if(await TextCommand(configData, message)) return
        if(await VoiceCommand(configData, message)) return
        if(await AdminCommand(configData, message, configData.admins)) return
    }
    else{
        handlePixivUrl(message)
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    
});

const TextCommand = async (configData:Iconfig, message:Message) => {
    const { content, channel } = message
    const { prefix, textCommands } = configData
    let errorMessage = false

    const command = hasCommands(textCommands, content, prefix, (message) => {
        channel.send(message)
        errorMessage = true
    })
    if(command){
        await useTextCommands(message, command as Icommand)
        return true
    }
    else if (errorMessage){
        return true
    }
}

const VoiceCommand = async (configData:Iconfig, message:Message) => {
    const { content, channel, author } = message
    const { prefix, voiceCommands } = configData
    let errorMessage = false
    
    const command = hasCommands(voiceCommands, content, prefix, (message) => { 
        channel.send(message)
        errorMessage = true
    })
    if(command && channel.type === "text") {
        await useVoiceCommands(message, command as IcommandVoice)
        return true
    }
    else if(command && channel.type !== "text") {
        channel.send(`Sorry ${await getNickname(author)}, i can't do that on this channel.`)
        return true
    }
    else if (errorMessage){
        return true
    }
}

const AdminCommand = async (configData:Iconfig, message:Message, adminArray:string[]) => {
    const { content, channel, author } = message
    const { prefix, adminCommands} = configData
    let errorMessage = false

    const id = adminArray.find(id => {
        return id === author.id
    })
    if(!id){
        channel.send("You don't have the authority for this, baka!")
        return true
    }

    const command = hasCommands(adminCommands, content, prefix, (message) => {
        channel.send(message)
        errorMessage = true
    })
    if(command){
        await useAdminCommands(message, command as Icommand)
        return true
    }
    else if (errorMessage){
        return true
    }
}