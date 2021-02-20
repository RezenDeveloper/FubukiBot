import { Message } from "discord.js";
import { clearStatus, setStatus } from "../../utils/utils";
import { currentQueue, currentVoiceChannel } from '../commandClasses'

export const pause = async (message:Message) => {

    const { channel } = message
    const voiceChannel = currentVoiceChannel.getChannel
    const dispatcher = currentVoiceChannel.getDispatcher
    const connection = currentVoiceChannel.getConnection

    if(currentVoiceChannel.getDispatcherStatus === "ended"){
        channel.send('This music is already over!')
        return
    }
    if(voiceChannel && dispatcher && connection){
        if(dispatcher.paused){
            channel.send("<:Menacing:603270364314730526> Toki wa ugoki dasu! <:Menacing:603270364314730526>")
            await setStatus(currentQueue.getQueue[currentQueue.getIndex].title, 'LISTENING')
            dispatcher.resume()
        }
        else{
            channel.send('<:Menacing:603270364314730526> Menacing: Toki wo Tomare! <:Menacing:603270364314730526>')
            await clearStatus()
            dispatcher.pause()
        }
    }
}