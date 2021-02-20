import { Message } from 'discord.js';
import { currentVoiceChannel } from '../commandClasses';

export const leave = (message:Message) => {
    if(currentVoiceChannel.getChannel){
        currentVoiceChannel.endConnection()
    }
}