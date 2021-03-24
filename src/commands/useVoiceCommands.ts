import { Message, VoiceChannel } from 'discord.js'
import { getNickname } from '../utils/utils'
import { play, pause, queue, playDirection, shuffle, time, search, clear, leave } from './voice/getVoiceCommands'
import { getCurrentQueue } from '././queueClass'
import type { QueueClass } from '././queueClass'

export const searchWaiting = async (message: Message) => {
    const currentQueue = getCurrentQueue(message.guild!.id)
    if(message.author.id !== '708065683971506186') await search(message, currentQueue, true)
}

export const useVoiceCommands = async (message: Message, commandObj?:IcommandVoice) => {
    const { channel, author, member } = message

    const { commands, needVoice } = commandObj!
    const memberChannel = member?.voice.channel
    const currentQueue = getCurrentQueue(message.guild!.id)

    if(!await isOnChannel(memberChannel, needVoice, currentQueue)){        
        channel.send(`Please join a voice channel first ${await getNickname(author)}!`)
        return
    }

    switch (commands[0]){
        case 'play':
            play(message, currentQueue)
            break
        case 'add':
            play(message, currentQueue, true)
            break
        case 'queue':
            queue(message, currentQueue)
            break
        case 'next':
            await playDirection.next(message, currentQueue)
            break
        case 'previous':
            await playDirection.prev(message, currentQueue)
            break
        case 'pause':
            await pause(message, currentQueue)
            break
        case 'shuffle':
            await shuffle(message, currentQueue)
            break
        case 'time':
            time(message, currentQueue)
            break
        case 'search':
            await search(message, currentQueue)
            break
        case 'clear':
            clear(message, currentQueue)
            break
        case 'leave':
            leave(message, currentQueue)
            break
    }
}

const isOnChannel = (memberChannel:VoiceChannel | null | undefined, needVoice:boolean, currentQueue:QueueClass) => {
    return new Promise( async (resolve:(res:boolean) => void) => {
        if(currentQueue.getChannel && !needVoice){
            return resolve(true)
        }
        if(!memberChannel) return resolve(false)

        if(currentQueue.getChannel !== memberChannel && needVoice){
            memberChannel.join().then(connection => {
                currentQueue.setChannel = memberChannel
                currentQueue.setConnection = connection
                resolve(true)
            })
        }
        else{
            resolve(true)
        }
    })
}