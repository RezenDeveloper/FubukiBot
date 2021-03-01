import { Message } from "discord.js";
import { clearStatus, getCheckEmote, setStatus } from "../../utils/utils";
import { currentQueue, currentVoiceChannel } from '../commandClasses'
import { getErrorEmote } from './../../utils/utils';

export const pause = async (message:Message) => {

    const { channel } = message
    const voiceChannel = currentVoiceChannel.getChannel
    const dispatcher = currentVoiceChannel.getDispatcher
    const connection = currentVoiceChannel.getConnection

    if(currentVoiceChannel.getDispatcherStatus === "ended"){
        channel.send('This music is already over!')
        message.react(getErrorEmote())
        return
    }
    if(voiceChannel && dispatcher && connection){
        if(dispatcher.paused){
            currentQueue.setPaused = false

            channel.send("<:Menacing:603270364314730526> Toki wa ugoki dasu! <:Menacing:603270364314730526>")
            message.react(getCheckEmote(message))
            await setStatus(currentQueue.getQueue[currentQueue.getIndex].title, 'LISTENING')
            dispatcher.resume()
        }
        else{
            currentQueue.setPaused = true

            channel.send('<:Menacing:603270364314730526> Menacing: Toki wo Tomare! <:Menacing:603270364314730526>')
            message.react(getCheckEmote(message))
            await clearStatus()
            dispatcher.pause()
        }
    }
}