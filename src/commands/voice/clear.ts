import { Message } from 'discord.js';
import { getCheckEmote } from '../../utils/utils';
import { currentQueue, currentVoiceChannel } from '../commandClasses';

export const clear = (message:Message) => {
    
    currentQueue.setQueue = []
    currentQueue.setIndex = 0
    currentVoiceChannel.endDispatcher()
    message.react(getCheckEmote(message))

}