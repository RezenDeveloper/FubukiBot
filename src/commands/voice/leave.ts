import { Message } from 'discord.js';
import { getCheckEmote } from '../../utils/utils';
import { currentVoiceChannel } from '../commandClasses';

export const leave = (message:Message) => {
    if(currentVoiceChannel.getChannel){
        currentVoiceChannel.endConnection()
        message.react(getCheckEmote(message))
    }
}