import { Message, MessageEmbed, MessageReaction, ReactionCollector, TextBasedChannels, User } from 'discord.js'
import { server } from '../../bot'
import { insertOneVideo } from '../../utils/api/fubuki/queue'
import { getCheckEmote } from '../../utils/utils'
import type { QueueClass } from './queueClass'

export class SearchEmbed {
  private _page: number
  private _embed: MessageEmbed
  private _message?: Message
  private _collector?: ReactionCollector
  private _result: VideoApi[]
  private _pagedResult: VideoApi[]
  private _currentQueue: QueueClass

  constructor(result: VideoApi[], currentQueue: QueueClass) {
    this._page = 1
    this._embed = this.buildEmbed()
    this._result = result
    this._pagedResult = result.slice(0, 10)
    this._currentQueue = currentQueue
  }

  private buildEmbed() {
    const searchEmbed = new MessageEmbed()
    searchEmbed.setColor('#0099ff')
    searchEmbed.setTitle('Search Results:')

    return searchEmbed
  }

  async sendEmbed(channel: TextBasedChannels) {
    const value = this._pagedResult.map(({ seconds: time, title }, index) => {
      const hours = Math.floor(time / 3600)
      let minutes = Math.floor(time / 60)
      if (minutes >= 60) minutes = minutes - hours * 60
      const seconds = time - Math.floor(time / 60) * 60
      return `**Song ${index + 1}** ${title} **${this.padNumber(hours)}:${this.padNumber(minutes)}:${this.padNumber(
        seconds
      )}**`
    })
    this._embed.setFields({ name: 'Videos', value: value.join('\n') })
    this._embed.setFooter(`Page ${this._page} of ${Math.ceil(this._result.length / 10)}`)

    const message = await channel.send({ embeds: [this._embed] })
    channel.send({
      content: `Please send the number of the song that you want to play \nYou can choose more than one using commas`,
    })

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
      if (reaction.emoji.name === '➡️') {
        const currentIndex = this._page * 10
        const nextIndex = (this._page + 1) * 10
        if (nextIndex > this._result.length) return

        this._page++
        const queue = this._result.slice(currentIndex, nextIndex)
        this.updateEmbed(queue, this._page)
        reaction.users.remove(user.id)
      }
      if (reaction.emoji.name === '⬅️') {
        const currentIndex = (this._page - 2) * 10
        const nextIndex = (this._page - 1) * 10
        if (currentIndex < 0) return

        this._page--
        const queue = this._result.slice(currentIndex, nextIndex)
        this.updateEmbed(queue, this._page)
        reaction.users.remove(user.id)
      }
    })
    this._message = message
    this.watchMessages(message, channel)
  }

  updateEmbed(queue: VideoApi[], page: number) {
    if (!this._embed || queue.length === 0) return

    this._embed.setFooter(`Page ${page} of ${Math.ceil(this._result.length / 10)}`)
    const value = queue.map(({ seconds: time, title }, index) => {
      const hours = Math.floor(time / 3600)
      let minutes = Math.floor(time / 60)
      if (minutes >= 60) minutes = minutes - hours * 60
      const seconds = time - Math.floor(time / 60) * 60
      return `**Song ${index + 1 + (page - 1) * 10}** ${title} **${this.padNumber(hours)}:${this.padNumber(
        minutes
      )}:${this.padNumber(seconds)}**`
    })
    this._embed.setFields({ name: 'Videos', value: value.join('\n') })
    this._message?.edit({ embeds: [this._embed] })
  }

  private watchMessages(message: Message, channel: TextBasedChannels) {
    const filter = ({ content }: Message) => {
      return /^([0-9]+,?\s*)+$/g.test(content)
    }
    const collector = channel.createMessageCollector({ filter, time: 60000 })

    collector.on('collect', async msg => {
      const { content } = msg
      const numbers = content.split(',').map(value => Number(value.trim()))

      for (let arrayIndex = 0; arrayIndex < numbers.length; arrayIndex++) {
        const value = numbers[arrayIndex]
        const index = value - 1

        if (index > this._result.length) {
          channel.send(`${value} is not a valid number!`)
          return
        }
        const music = this._result[index]
        const push = this._currentQueue.length !== 0

        const data = await insertOneVideo(message.guild!.id, music.url!, push)
        if (!data) return

        if (push) channel.send(`**${data.title}** was added to the queue!`)
        else channel.send(`Playing: **${data.title}**`)
        msg.react(getCheckEmote())

        collector.stop()
      }
    })

    collector.on('end', (collect, reason) => {
      if (reason === 'time') {
        channel.send('Looks like nobody is responding...')
      }
    })
  }

  private padNumber(number: number) {
    return ('0' + number).slice(-2)
  }
}
