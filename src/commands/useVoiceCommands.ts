import { Message, VoiceChannel } from 'discord.js'
import { getNickname } from '../utils/utils'
import { play, pause, queue, playDirection, shuffle, time, search, clear, leave } from './voice/getVoiceCommands'
import { currentVoiceChannel } from '././commandClasses'

export const searchWaiting = async (message: Message) => {
    if(message.author.id !== '708065683971506186') await search(message,true)
}

export const useVoiceCommands = async (message: Message, commandObj?:IcommandVoice) => {
    const { channel, author, member } = message

    const { commands, needVoice } = commandObj!
    const memberChannel = member?.voice.channel

    if(!await isOnChannel(memberChannel, needVoice)){        
        channel.send(`Please join a voice channel first ${await getNickname(author)}!`)
        return
    }

    switch (commands[0]){
        case 'play':
            play(message)
            break
        case 'add':
            play(message, true)
            break
        case 'queue':
            queue(message)
            break
        case 'next':
            await playDirection.next(message)
            break
        case 'previous':
            await playDirection.prev(message)
            break
        case 'pause':
            await pause(message)
            break
        case 'shuffle':
            await shuffle(message)
            break
        case 'time':
            time(message)
            break
        case 'search':
            await search(message)
            break
        case 'clear':
            await clear(message)
            break
        case 'leave':
            leave(message)
            break
    }
}

const isOnChannel = (memberChannel:VoiceChannel | null | undefined, needVoice:boolean) => {
    return new Promise( async (resolve:(res:boolean) => void) => {
        if(currentVoiceChannel.getChannel && !needVoice){
            resolve(true)
        }
        else if(memberChannel){ 
            if(currentVoiceChannel.getChannel !== memberChannel && needVoice){
                memberChannel.join().then(connection => {
                    currentVoiceChannel.setChannel = memberChannel
                    currentVoiceChannel.setConnection = connection
                    resolve(true)
                })
            }
            else{
                resolve(true)
            }
        }
        else{
            resolve(false)
        }
    })
}