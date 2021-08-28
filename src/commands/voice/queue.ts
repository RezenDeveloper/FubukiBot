import { Message, TextChannel } from 'discord.js'
import { FieldsEmbed } from 'discord-paginationembed'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'
import type { QueueClass } from '../classes/queueClass'
import { getQueueTitle } from '../../utils/api/fubuki/queue'

export const queue = async (message: Message, currentQueue: QueueClass) => {
  const { channel, content } = message
  const currentQueueArray = currentQueue.queue

  if (currentQueueArray.length === 0) {
    channel.send("There's no queue to show")
    message.react(getErrorEmote())
    return
  }
  const number = parseFloat(content.split(' ')[1])

  if (!number) {
    currentQueue.queueEmbed.sendEmbed(channel as TextChannel)
    setTimeout(() => {
      currentQueue.currentPlaying.sendCurrentEmbed(channel)
    }, 500)
  } else {
    if (number <= currentQueue.length && number > 0) {
      const { isShuffle } = currentQueue.shuffle
      const index = number - 1

      if (isShuffle) {
        const { error } = currentQueue.shuffle.addToShuffleList(index)
        if (error) currentQueue.shuffle.backToIndex(index)
      }

      currentQueue.index = index
      message.react(getCheckEmote())
    } else {
      channel.send('This is not a valid number')
      message.react(getErrorEmote())
    }
  }
}
