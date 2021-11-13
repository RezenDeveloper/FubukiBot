import { playCurrentMusic } from './playCurrentMusic'
import { Message } from 'discord.js'
import { getNickname, getErrorEmote, getCheckEmote } from './../../utils/utils'
import type { QueueClass } from '../classes/queueClass'

export const prev = async (message: Message, currentQueue: QueueClass) => {
  const index = currentQueue.actualIndex
  const length = currentQueue.length
  const { channel } = message
  const name = await getNickname(message)

  if (length === 0) {
    channel.send(`I can't do that without a queue ${name}!`)
    message.react(getErrorEmote())
    return
  }
  if (currentQueue.shuffle.isShuffle) {
    const { error } = await currentQueue.shuffle.prevShuffleIndex()
    if (error) {
      channel.send(`${error} ${name}!`)
      message.react(getErrorEmote())
    } else {
      message.react(getCheckEmote())
    }
    return
  }
  if (index > 0) {
    currentQueue.prevIndex()
    message.react(getCheckEmote())
  } else {
    if (currentQueue.isOnLoop) return currentQueue.prevIndex()
    channel.send(`This is the first song ${name}!`)
    message.react(getErrorEmote())
  }
}

export const next = async (message: Message, currentQueue: QueueClass) => {
  const index = currentQueue.actualIndex
  const isShuffle = currentQueue.shuffle.isShuffle
  const length = currentQueue.length
  const { channel } = message
  const name = await getNickname(message)

  if (length === 0) {
    channel.send(`I can't do that without a queue ${name}!`)
    message.react(getErrorEmote())
    return
  }

  if (isShuffle) {
    const { error } = await currentQueue.shuffle.nextShuffleIndex()
    if (error) {
      channel.send(`${error} ${name}!`)
      message.react(getErrorEmote())
    } else {
      message.react(getCheckEmote())
    }
    return
  }

  if ((index + 1 < length) || currentQueue.isOnLoop) {
    currentQueue.nextIndex()
    message.react(getCheckEmote())
  } else {
    channel.send(`This is the last song ${name}!`)
    message.react(getErrorEmote())
  }
}
