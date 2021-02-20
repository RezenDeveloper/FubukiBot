import { Message } from 'discord.js';
import { config } from '../commandClasses';
import { setStatus as setStatusUtils, clearStatus as clearStatusUtils } from './../../utils/utils';

type statusType = "LISTENING" | "PLAYING" | "STREAMING" | "WATCHING" | "COMPETING" | "CUSTOM_STATUS"

export const setStatus = async (message:Message) => {
    const { content, channel } = message

    const contentArray = content.split(' ') 
    const [_, type, status] = contentArray
    const statusArray = ["LISTENING", "PLAYING", "STREAMING", "WATCHING", "COMPETING"]
    const statusList = statusArray.map(value => value.toLowerCase()).join(' or ')

    if(!type || !statusArray.includes(type.toUpperCase()) || !status){
        channel.send(`Wrong sentence. Try ${(await config.getConfig).prefix}setstatus (${statusList}) (status message)`)
        return
    }
    else{
        setStatusUtils(status, type.toUpperCase() as statusType)
    }

}

export const clearStatus = async (message:Message) => {
    await clearStatusUtils()
}