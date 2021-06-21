import { Message } from 'discord.js';
import { getCheckEmote } from '../../utils/utils';
import type { QueueClass } from '../queueClass';

export const clear = (message:Message, currentQueue:QueueClass) => {
    currentQueue.clearQueue()
    message.react(getCheckEmote(message))
}