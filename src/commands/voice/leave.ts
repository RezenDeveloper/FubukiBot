import { Message } from 'discord.js';
import { getCheckEmote } from '../../utils/utils';
import type { QueueClass } from '../queueClass';

export const leave = (message:Message, currentQueue:QueueClass) => {
    if(currentQueue.getChannel){
        currentQueue.endConnection()
        message.react(getCheckEmote(message))
    }
}