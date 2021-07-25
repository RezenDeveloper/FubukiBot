import { Message, TextChannel } from 'discord.js'
import { FieldsEmbed } from 'discord-paginationembed'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'
import type { QueueClass } from '../classes/queueClass'
import { getQueueTitle } from '../../utils/api/fubuki/queue'

export const queue = async (message: Message, currentQueue: QueueClass) => {
  const { channel, content } = message
  const currentQueueArray = currentQueue.getQueue

  if (currentQueueArray.length === 0) {
    channel.send("There's no queue to show")
    message.react(getErrorEmote())
    return
  }
  const number = parseFloat(content.split(' ')[1])

  if (!number) {
    currentQueue.sendQueueEmbed(channel as TextChannel)
    setTimeout(() => {
      currentQueue.sendCurrentEmbed(channel)
    }, 1000)
  } else {
    console.log(number)
    if (number <= currentQueue.getLength && number > 0) {
      currentQueue.setIndex = number - 1
      message.react(getCheckEmote(message))
    } else {
      channel.send('This is not a valid number')
      message.react(getErrorEmote())
    }
  }
}
