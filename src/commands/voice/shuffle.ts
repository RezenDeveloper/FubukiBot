import { Message } from 'discord.js'
import { getCheckEmote, getErrorEmote, getNickname } from './../../utils/utils'
import { playCurrentMusic } from './playCurrentMusic'
import type { QueueClass } from '../classes/queueClass'

export const shuffle = async (message: Message, currentQueue: QueueClass) => {
  const { channel } = message
  const { length } = currentQueue.queue

  if (currentQueue.shuffle.isShuffle) {
    currentQueue.shuffle.isShuffle = false
    channel.send(`Shuffle mode off!`)
    message.react(getCheckEmote())
    return
  }

  if (length === 0) {
    channel.send(`I can't shuffle a queue that doesn't exist ${await getNickname(message)}!`)
    message.react(getErrorEmote())
    return
  }
  if (length === 1) {
    channel.send(`You know i need at least two sounds to shuffle right?`)
    message.react(getErrorEmote())
    return
  }
  currentQueue.shuffle.isShuffle = true
  currentQueue.shuffle.nextShuffleIndex()
  message.react(getCheckEmote())
  channel.send(`Shuffle mode on!`)
}
