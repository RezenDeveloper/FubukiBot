import Discord from 'discord.js'

import 'dotenv/config'
import { isTextCommand } from './commands/handleTextCommands'
import { searchWaiting, isVoiceCommand } from './commands/handleVoiceCommands'
import { isAdminCommand } from './commands/handleAdminCommands'
import { searchObj } from './commands/commandClasses'
import { getCurrentQueue, updateCurrentQueue } from './commands/queueClass'

import { handlePixivUrl } from './commands/text/pixivUrl'

import { getConfig } from './utils/api/fubuki/config'
import { updateUser } from './utils/api/fubuki/users'

const { TOKEN } = process.env;
export const client = new Discord.Client()

client.once('ready', async () => {
    console.log('Ready!')
});

client.on('message', async message => {
    const configData = await getConfig()
    
    if(searchObj.getWaiting) return await searchWaiting(message)

    if(message.content.charAt(0) === configData.prefix){
        if(await isTextCommand(message)) return
        if(await isVoiceCommand(message)) return
        if(await isAdminCommand(message)) return
    }

    handlePixivUrl(message)
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const configData = await getConfig()
    const serverId = oldState.guild.id || newState.guild.id
    const currentQueue = getCurrentQueue(serverId)
    
    const userId = newState.member?.user.id
    const currentChannel = newState.channelID || ''

    if(userId){
        updateUser(userId, { currentChannel })
    }
    
    if(currentQueue.getLeaveTimeout && currentQueue.getChannel?.id === currentChannel) {
        currentQueue.clearLeaveTimeout()
    }

    if(currentQueue.getChannel && !currentQueue.getLeaveTimeout){
        const members = currentQueue.getChannel.members.map(value => value.user.id)
        if(!members.length) return
        
        if(members[0] === configData.botId){
            currentQueue.leaveIn(60)
            updateCurrentQueue(serverId, currentQueue)
        }
    }
})

client.login(TOKEN)