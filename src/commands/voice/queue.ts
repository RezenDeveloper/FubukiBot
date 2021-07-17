import { Message, TextChannel } from 'discord.js'
import { FieldsEmbed } from 'discord-paginationembed'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'
import type { QueueClass } from '../queueClass'
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
    const QueueEmbed = new FieldsEmbed()
    QueueEmbed.embed.setColor('#0099ff')
    QueueEmbed.embed.setTitle('Current Queue')
    QueueEmbed.setChannel(channel as TextChannel)
    QueueEmbed.setElementsPerPage(10)
    QueueEmbed.setAuthorizedUsers([])
    QueueEmbed.setArray(currentQueueArray)

    QueueEmbed.embed.setFooter(`Page ${currentQueue.getPage + 1} of ${Math.floor(currentQueue.getLength / 10) + 1}`)
    QueueEmbed.formatField('Musics', i => {
      const { index, title } = i as Music
      return `**Song ${index + 1}** -- ${title}`
    })
    QueueEmbed.setDisabledNavigationEmojis(['all'])
    QueueEmbed.setTimeout(0)
    QueueEmbed.setFunctionEmojis({
      '⬅️': async (user, instance) => {
        const data = await getQueueTitle(currentQueue.getChannel!.id, QueueEmbed.page - 1)
        if (!data) return
        const { queue, page } = data
        QueueEmbed.setPage('back')
        QueueEmbed.embed.setFooter(`Page ${page + 1} of ${Math.floor(currentQueue.getLength / 10) + 1}`)
        QueueEmbed.setArray(queue)
      },
      '➡️': async (user, instance) => {
        const data = await getQueueTitle(currentQueue.getChannel!.id, QueueEmbed.page)
        if (!data) return
        const { queue, page } = data
        QueueEmbed.setPage('forward')
        QueueEmbed.embed.setFooter(`Page ${page + 1} of ${Math.floor(currentQueue.getLength / 10) + 1}`)
        QueueEmbed.setArray(queue)
      },
    })
    QueueEmbed.build()

    setTimeout(() => {
      currentQueue.sendCurrentEmbed(channel)
    }, 1000)
  } else {
    if (number <= currentQueue.getLength && number > 0) {
      currentQueue.setIndex = number - 1
      message.react(getCheckEmote(message))
    } else {
      channel.send('This is not a valid number')
      message.react(getErrorEmote())
    }
  }
}
