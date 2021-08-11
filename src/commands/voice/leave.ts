import { Message } from 'discord.js'
import { getCheckEmote } from '../../utils/utils'
import type { QueueClass } from '../classes/queueClass'

export const leave = (message: Message, currentQueue: QueueClass) => {
  if (currentQueue.getChannel) {
    currentQueue.index = 0
    currentQueue.endConnection()
    message.react(getCheckEmote(message))
  }
}
