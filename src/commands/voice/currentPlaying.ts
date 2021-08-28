import { Message } from 'discord.js'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'
import type { QueueClass } from '../classes/queueClass'

export const currentPlaying = async (message: Message, currentQueue: QueueClass) => {
  try {
    currentQueue.currentPlaying.sendCurrentEmbed(message.channel)
    message.react(getCheckEmote())
  } catch (error) {
    message.channel.send('Please add some music before!')
    message.react(getErrorEmote())
  }
}
