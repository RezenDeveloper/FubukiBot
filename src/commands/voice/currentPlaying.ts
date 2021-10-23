import { Message } from 'discord.js'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'
import type { QueueClass } from '../classes/queueClass'

export const currentPlaying = async (message: Message, currentQueue: QueueClass) => {
  
  const { error } = await currentQueue.currentPlaying.sendCurrentEmbed(message.channel)
  
  if(error) {
    message.channel.send('Please add some music before!')
    message.react(getErrorEmote())
    return
  }
  
  message.react(getCheckEmote())
}
