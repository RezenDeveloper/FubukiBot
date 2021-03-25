import { Message } from 'discord.js'
import { clearStatus, setStatus } from './admin/status';
import { deleteMessage, sendMessage } from './admin/message';
import { getDBConfig, hasCommands } from '../utils/utils';

export const isAdminCommand = async (message:Message) => {
    const configData = await getDBConfig()
    const { content, channel, author } = message
    const { prefix, adminCommands, admins} = configData
    let errorMessage = false

    const id = admins.find(id => {
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
    if(errorMessage) return true

    if(command){
        await handleAdminCommands(message, command as Icommand)
        return true
    }
    return false
}

const handleAdminCommands = async (message:Message, {commands}:Icommand) => {
    switch (commands[0]){
        case 'setstatus':
            await setStatus(message)
            break
        case 'clearstatus':
            await clearStatus(message)
            break
        case 'sendmessage':
            sendMessage(message)
            break
        case 'deletemessage':
            deleteMessage(message)
            break
    } 
}