import { Message } from 'discord.js';
import { currentQueue } from '../commandClasses';
import { getNickname } from './../../utils/utils';
import { playCurrentMusic } from './playCurrentMusic';

export const shuffle = async (message:Message) => {
    const { channel, author } = message
    const { length } = currentQueue.getQueue
    if(length === 0){
        channel.send(`I can't shuffle a queue that doesn't exist ${await getNickname(author)}!`)
        return
    }
    if(length === 1){
        channel.send(`You know i need two sounds to shuffle right?`)
        return
    }
    currentQueue.shuffleQueue()
    playCurrentMusic()
}