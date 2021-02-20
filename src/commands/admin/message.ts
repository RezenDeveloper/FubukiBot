import { Channel, DMChannel, Message, NewsChannel, TextChannel } from 'discord.js';
import { config } from '../commandClasses';
import { MongoSearch } from './../../database/bd';
import { client } from './../../bot';
import { getCheckEmote, getErrorEmote } from '../../utils/utils';

type someChannel = TextChannel | DMChannel | NewsChannel
export const sendMessage = async (message:Message) => {
    const { content, channel } = message

    const contentArray = content.split(' ') 
    const [_, id, text] = contentArray

    const send = (sendChannel: Channel | undefined) => {
        if(!sendChannel){
            channel.send('Sorry, i could not find a channel with this id')
            message.react(getErrorEmote())
            return
        }
        if(!sendChannel.isText()){
            channel.send('This is not a valid channel')
            message.react(getErrorEmote())
            return
        }
        sendChannel.send(text)
        message.react(getCheckEmote(message))
    }
    
    if(!id || !text){
        channel.send(`Wrong sentence. Try ${(await config.getConfig).prefix}sendMessage (channelID) (message)`)
        message.react(getErrorEmote())
        return
    }
    if(parseFloat(id) !== NaN && id.length === 18){
        const sendChannel = client.channels.cache.get(id)
        send(sendChannel)
    }
    else{
        const sendChannel = client.channels.cache.get(await getChannelId(id))
        send(sendChannel)
    }
}

export const deleteMessage = async (message:Message) => {
    const { content, channel } = message

    const contentArray = content.split(' ') 
    const [_, messageId, channelId] = contentArray

    if(!messageId || !channelId){
        channel.send(`Wrong sentence. Try ${(await config.getConfig).prefix}deleteMessage (messageID) (channelID)`)
        message.react(getErrorEmote())
        return
    }
    let sendChannel: Channel | undefined
    if(parseFloat(channelId) !== NaN && channelId.length === 18){
        sendChannel = client.channels.cache.get(channelId)
    }
    else{
        sendChannel = client.channels.cache.get(await getChannelId(channelId))
    }
    if(!sendChannel){
        channel.send('Sorry, i could not find a channel with this id')
        message.react(getErrorEmote())
        return
    }
    if(!sendChannel.isText()){
        channel.send('This is not a valid channel')
        message.react(getErrorEmote())
        return
    }
    if(parseFloat(messageId) !== NaN && messageId.length === 18){
        const messageData = await sendChannel.messages.fetch()
        const msgToDelete = messageData.find((value, key, collection) => {
            return key === messageId
        })
        if(msgToDelete){
            if(msgToDelete.deletable){
                msgToDelete.delete()
                message.react(getCheckEmote(message))
            }
            else{
                channel.send(`I can't delete this message`)
                message.react(getErrorEmote())
            }
        }
        else{
            channel.send(`I couldn't find a message with this id`)
            message.react(getErrorEmote())
        }
    }
    
}

const getChannelId = async (name:string) => {
    const channel = await MongoSearch('channels',{ name }) as Ichannels[]
    const { id } = channel[0]
    return id
}