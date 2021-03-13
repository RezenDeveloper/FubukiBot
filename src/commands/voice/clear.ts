import { Message } from 'discord.js';
import { getCheckEmote } from '../../utils/utils';
import { currentQueue } from '../queueClass';

export const clear = (message:Message) => {
    
    currentQueue.clearQueue()
    message.react(getCheckEmote(message))
}