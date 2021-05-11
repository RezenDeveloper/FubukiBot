import { Message } from "discord.js";
import { getCheckEmote } from "../../utils/utils";
import type { QueueClass } from '../queueClass';
import { getErrorEmote } from './../../utils/utils';

export const pause = async (message:Message, currentQueue:QueueClass) => {

    const { channel } = message
    const voiceChannel = currentQueue.getChannel
    const dispatcher = currentQueue.getDispatcher
    const connection = currentQueue.getConnection

    if(currentQueue.getDispatcherStatus === "ended"){
        channel.send('This music already ended!')
        message.react(getErrorEmote())
        return
    }
    if(voiceChannel && dispatcher && connection){
        if(currentQueue.isPaused){
            currentQueue.setPaused = false

            channel.send("<:Menacing:603270364314730526> Toki wa ugoki dasu! <:Menacing:603270364314730526>")
            message.react(getCheckEmote(message))
        }
        else{
            currentQueue.setPaused = true

            channel.send('<:Menacing:603270364314730526> Toki wo Tomare! <:Menacing:603270364314730526>')
            message.react(getCheckEmote(message))
        }
    }
}