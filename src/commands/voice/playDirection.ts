import { playCurrentMusic } from './playCurrentMusic'
import { Message } from 'discord.js'
import { getNickname, getErrorEmote, getCheckEmote } from './../../utils/utils'
import type { QueueClass } from '../queueClass'

export const prev = async (message: Message, currentQueue: QueueClass) => {
  const index = currentQueue.getIndex * currentQueue.getPage
  const lenght = currentQueue.getLenght
  const { channel } = message
  const name = await getNickname(message)

  if (lenght === 0) {
    channel.send(`I can't do that without a queue ${name}!`)
    message.react(getErrorEmote())
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
  const index = currentQueue.getIndex * currentQueue.getPage
  const lenght = currentQueue.getLenght
  const { channel } = message
  const name = await getNickname(message)

  if (lenght === 0) {
    channel.send(`I can't do that without a queue ${name}!`)
    message.react(getErrorEmote())
    return
  }
  if (index + 1 < lenght) {
    currentQueue.nextIndex()
    message.react(getCheckEmote(message))
  } else {
    channel.send(`This is the last song ${name}!`)
    message.react(getErrorEmote())
  }
}
