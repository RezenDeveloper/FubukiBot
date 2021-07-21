import { Message, VoiceChannel } from 'discord.js'
import { getNickname, hasCommands } from '../utils/utils'
import { play, pause, queue, playDirection, shuffle, time, search, clear, leave } from './voice/getVoiceCommands'
import { getCurrentQueue } from './classes/queueClass'
import type { QueueClass } from './classes/queueClass'
import { getConfig } from '../utils/api/fubuki/config'
import { insertServer } from '../utils/api/fubuki/server'

export const searchWaiting = async (message: Message) => {
  const currentQueue = getCurrentQueue(message.guild!.id)
  if (message.author.id !== '708065683971506186') await search(message, currentQueue, true)
}

export const isVoiceCommand = async (message: Message) => {
  const configData = await getConfig()
  if (!configData) return
  const { content, channel } = message
  const { prefix, voiceCommands } = configData
  let errorMessage = false

  const command = hasCommands(voiceCommands, content, prefix, message => {
    channel.send(message)
    errorMessage = true
  })
  if (command && channel.type === 'text') {
    await handleVoiceCommands(message, command as IcommandVoice)
    return true
  } else if (command && channel.type !== 'text') {
    channel.send(`Sorry ${await getNickname(message)}, i can't do that on this channel.`)
    return true
  } else if (errorMessage) {
    return true
  }
}

const handleVoiceCommands = async (message: Message, commandObj?: IcommandVoice) => {
  const { channel, member } = message

  const { commands, needVoice } = commandObj!
  const memberChannel = member?.voice.channel
  const currentQueue = getCurrentQueue(message.guild!.id)

  if (!(await isOnChannel(memberChannel, needVoice, currentQueue))) {
    channel.send(`Please join a voice channel first ${await getNickname(message)}!`)
    return
  }

  switch (commands[0]) {
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
      clear(message)
      break
    case 'leave':
      leave(message, currentQueue)
      break
  }
}

const isOnChannel = (memberChannel: VoiceChannel | null | undefined, needVoice: boolean, currentQueue: QueueClass) => {
  return new Promise(async (resolve: (res: boolean) => void) => {
    if (currentQueue.getChannel && !needVoice) {
      return resolve(true)
    }
    if (!memberChannel) return resolve(false)

    if (!currentQueue.getConnection || (currentQueue.getChannel !== memberChannel && needVoice)) {
      memberChannel.join().then(async connection => {
        await currentQueue.setChannel(memberChannel)
        currentQueue.setConnection = connection
        currentQueue.startWatch()
        resolve(true)
      })
    } else {
      resolve(true)
    }
  })
}
