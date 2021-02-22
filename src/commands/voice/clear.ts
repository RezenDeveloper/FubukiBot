import { Message } from 'discord.js';
import { getCheckEmote } from '../../utils/utils';
import { currentQueue, currentVoiceChannel } from '../commandClasses';

export const clear = (message:Message) => {
    
    currentQueue.setIndex = 0
    currentQueue.setQueue = []
    currentVoiceChannel.endDispatcher()
    message.react(getCheckEmote(message))
}