import { Message } from 'discord.js';
import { getCheckEmote, getErrorEmote, getNickname } from './../../utils/utils';
import { playCurrentMusic } from './playCurrentMusic';
import type { QueueClass } from '../queueClass';

export const shuffle = async (message:Message, currentQueue:QueueClass) => {
    const { channel, author } = message
    const { length } = currentQueue.getQueue
    if(length === 0){
        channel.send(`I can't shuffle a queue that doesn't exist ${await getNickname(author)}!`)
        message.react(getErrorEmote())
        return
    }
    if(length === 1){
        channel.send(`You know i need at least two sounds to shuffle right?`)
        message.react(getErrorEmote())
        return
    }
    currentQueue.shuffleQueue()
    message.react(getCheckEmote(message))
    playCurrentMusic(currentQueue)
}