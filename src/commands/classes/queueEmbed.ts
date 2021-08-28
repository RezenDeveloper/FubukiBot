import {
  EmbedFieldData,
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
  TextChannel,
  User,
} from 'discord.js'
import { server } from '../../bot'
import { getQueueTitle } from '../../utils/api/fubuki/queue'
import { QueueClass } from './queueClass'

interface FieldQueue {
  title: string
  index: number
}

export class QueueEmbed {
  private _currentQueue: QueueClass
  private _page: number
  private _embed: MessageEmbed
  private _message?: Message
  private _collector?: ReactionCollector

  constructor(currentQueue: QueueClass) {
    this._currentQueue = currentQueue
    this._page = currentQueue.page
    this._embed = this.buildEmbed()
  }

  private buildEmbed() {
    const QueueEmbed = new MessageEmbed()
    QueueEmbed.setColor('#0099ff')
    QueueEmbed.setTitle('Current Queue')

    return QueueEmbed
  }

  async sendEmbed(channel: TextChannel) {
    const value = this._currentQueue.queue.map(({ index, title }) => {
      return `**Song ${index + 1}** -- ${title}`
    })
    this._page = this._currentQueue.page
    this._embed.setFields({ name: 'Musics', value: value.join('\n') })
    this._embed.setFooter(`Page ${this._page + 1} of ${Math.ceil(this._currentQueue.length / 10)}`)

    const message = await channel.send({ embeds: [this._embed] })

    await message.react('⬅️')
    await message.react('➡️')

    const filter = (reaction: MessageReaction, user: User) => {
      if (!reaction.emoji.name) return false
      return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id !== server.config.botId
    }
    const collector = message.createReactionCollector({ filter })
    if (this._collector) this._collector.stop()
    this._collector = collector
    collector.on('collect', async (reaction, user) => {
      const channelId = this._currentQueue.getChannel!.id
      const queueId = this._currentQueue.queueId
      const queuePage = this._page

      if (reaction.emoji.name === '➡️') {
        const data = await getQueueTitle(channelId, queueId, queuePage + 1)
        if (!data) return
        const { queue, page } = data
        this._page++
        this.updateEmbed(queue, page)
        reaction.users.remove(user.id)
      }
      if (reaction.emoji.name === '⬅️') {
        const data = await getQueueTitle(channelId, queueId, queuePage - 1)
        if (!data) return
        const { queue, page } = data
        this._page--
        this.updateEmbed(queue, page)
        reaction.users.remove(user.id)
      }
    })
    this._message = message
  }

  updateEmbed(queue: FieldQueue[] | Music[], page: number) {
    if (!this._embed || queue.length === 0) return

    this._embed.setFooter(`Page ${page + 1} of ${Math.ceil(this._currentQueue.length / 10)}`)
    const value = queue.map(({ index, title }) => {
      return `**Song ${index + 1}** -- ${title}`
    })
    this._embed.setFields({ name: 'Musics', value: value.join('\n') })
    this._message?.edit({ embeds: [this._embed] })
  }
}
