import { Message } from 'discord.js';
import { currentQueue, currentVoiceChannel } from '../commandClasses';

export const clear = (message:Message) => {
    
    currentQueue.setQueue = []
    currentQueue.setIndex = 0
    currentVoiceChannel.endDispatcher()

}