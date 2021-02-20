import { currentQueue } from '../commandClasses';
import { playCurrentMusic } from './playCurrentMusic';
import { Message } from 'discord.js';
import { getNickname } from './../../utils/utils';
import { currentVoiceChannel } from './../commandClasses';

export const prev = async (message:Message) => {
    const index = currentQueue.getIndex
    const lenght = currentQueue.getQueue.length
    const { channel, author } = message
    const name = await getNickname(author)

    if(lenght === 0){
        channel.send(`I can't do that without a queue ${name}!`)
        return 
    }
    if(index > 0){
        currentQueue.prevIndex()
        playCurrentMusic()
    }
    else if ( currentVoiceChannel.getDispatcherStatus === 'ended' ){
        playCurrentMusic()
    }
    else{
        channel.send(`This is the first song ${name}!`)
    }
}

export const next = async (message:Message) => {
    const index = currentQueue.getIndex
    const lenght = currentQueue.getQueue.length
    const { channel, author } = message
    const name = await getNickname(author)

    if(lenght === 0){
        channel.send(`I can't do that without a queue ${name}!`)
        return 
    }
    if((index+1) < lenght){
        currentQueue.nextIndex()
        playCurrentMusic()
    }
    else{
        channel.send(`This is the last song ${name}!`)
    }
}