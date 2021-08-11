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
    currentQueue.shuffle.prevShuffleIndex().catch(error => {
      channel.send(`${error} ${name}!`)
      message.react(getErrorEmote())
    })
    return
  }
  if (index > 0) {
    currentQueue.prevIndex()
    message.react(getCheckEmote(message))
  } else {
    channel.send(`This is the first song ${name}!`)
    message.react(getErrorEmote())
  }
}

export const next = async (message: Message, currentQueue: QueueClass) => {
  const index = currentQueue.actualIndex
  const length = currentQueue.length
  const { channel } = message
  const name = await getNickname(message)

  if (length === 0) {
    channel.send(`I can't do that without a queue ${name}!`)
    message.react(getErrorEmote())
    return
  }
  if (index + 1 < length) {
    currentQueue.nextIndex()
    message.react(getCheckEmote(message))
  } else {
    channel.send(`This is the last song ${name}!`)
    message.react(getErrorEmote())
  }
}
