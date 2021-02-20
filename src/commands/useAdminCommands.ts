import { Message } from 'discord.js'
import { clearStatus, setStatus } from './admin/status';
import { deleteMessage, sendMessage } from './admin/message';

export const useAdminCommands = async (message:Message, {commands}:Icommand) => {
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