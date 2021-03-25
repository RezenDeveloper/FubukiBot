import Discord from 'discord.js'
import { isTextCommand } from './commands/handleTextCommands'
import { searchWaiting, isVoiceCommand } from './commands/handleVoiceCommands'
import { isAdminCommand } from './commands/handleAdminCommands'
import { searchObj } from './commands/commandClasses';
import { handlePixivUrl } from './commands/text/pixivUrl';
import { MongoFindOne, MongoUpdateOne } from './database/bd'
import { getCurrentQueue, updateCurrentQueue } from './commands/queueClass'
import { getDBConfig } from './utils/utils';

const { TOKEN } = process.env;
export const client = new Discord.Client()

client.once('ready', async () => {
    console.log('Ready!')
});

client.on('message', async message => {
    const configData = await getDBConfig()
    if(searchObj.getWaiting) return await searchWaiting(message)

    if(message.content.charAt(0) === configData.prefix){
        if(await isTextCommand(message)) return
        if(await isVoiceCommand(message)) return
        if(await isAdminCommand(message)) return
    }

    handlePixivUrl(message)
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const serverId = oldState.guild.id || newState.guild.id
    const currentQueue = getCurrentQueue(serverId)
    
    const userId = newState.member?.user.id
    const channelId = newState.channelID
    const data = await MongoFindOne('users', { userId }, { userId: 1 })
    if(!!data){
        await MongoUpdateOne('users', { userId }, { currentChannel: channelId ? channelId : '' })
    }
    
    if(currentQueue.getLeaveTimeout && currentQueue.getChannel?.id === channelId) {
        currentQueue.clearLeaveTimeout()
    }

    if(currentQueue.getChannel && !currentQueue.getLeaveTimeout){
        const members = currentQueue.getChannel.members.map(value => value.user.id)
        if(!members.length) return
        
        if(members[0] === (await getDBConfig()).botId){
            currentQueue.leaveIn(5)
            updateCurrentQueue(serverId, currentQueue)
        }
    }
})

client.login(TOKEN)