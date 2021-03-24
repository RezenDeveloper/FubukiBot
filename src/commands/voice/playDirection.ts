import { playCurrentMusic } from './playCurrentMusic';
import { Message } from 'discord.js';
import { getNickname, getErrorEmote, getCheckEmote } from './../../utils/utils';
import type { QueueClass } from '../queueClass';

export const prev = async (message:Message, currentQueue:QueueClass) => {
    const index = currentQueue.getIndex
    const lenght = currentQueue.getQueue.length
    const { channel, author } = message
    const name = await getNickname(author)

    if(lenght === 0){
        channel.send(`I can't do that without a queue ${name}!`)
        message.react(getErrorEmote())
        return 
    }
    if(index > 0){
        currentQueue.prevIndex()
        playCurrentMusic(currentQueue)
        message.react(getCheckEmote(message))
    }
    else if ( currentQueue.getDispatcherStatus === 'ended' ){
        playCurrentMusic(currentQueue)
        message.react(getCheckEmote(message))
    }
    else{
        channel.send(`This is the first song ${name}!`)
        message.react(getErrorEmote())
    }
}

export const next = async (message:Message, currentQueue:QueueClass) => {
    const index = currentQueue.getIndex
    const lenght = currentQueue.getQueue.length
    const { channel, author } = message
    const name = await getNickname(author)

    if(lenght === 0){
        channel.send(`I can't do that without a queue ${name}!`)
        message.react(getErrorEmote())
        return 
    }
    if((index+1) < lenght){
        currentQueue.nextIndex()
        message.react(getCheckEmote(message))
        playCurrentMusic(currentQueue)
    }
    else{
        channel.send(`This is the last song ${name}!`)
        message.react(getErrorEmote())
    }
}