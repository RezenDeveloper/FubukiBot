import { Message } from 'discord.js'
import { getCheckEmote } from '../../utils/utils'
import { getCurrentQueue } from '../classes/queueClass'

export const loop = async (message: Message) => {
  const { channel } = message
  const currentQueue = getCurrentQueue(message.guild!.id)
  const newLoopIsTrue = !currentQueue.isOnLoop

  currentQueue.loop(newLoopIsTrue)

  if (newLoopIsTrue) {
    channel.send('Loop on!')
  }
  else {
    channel.send('Loop off!')
  }

  message.react(getCheckEmote())
}
