import { Message, MessageEmbed, MessageReaction, ReactionCollector, TextBasedChannels, User } from 'discord.js'
import { server } from '../../bot'
import { QueueClass } from './queueClass'

export class CurrentPlaying {
  private _currentQueue: QueueClass
  private _message?: Message
  private _collector?: ReactionCollector

  constructor(currentQueue: QueueClass) {
    this._currentQueue = currentQueue
  }

  updateEmbed() {
    if (!this._message) return
    this._message.edit({ embeds: [this.embed] })
  }

  async sendCurrentEmbed(channel: TextBasedChannels) {
    if (this._currentQueue.length === 0) return { error: 'Queue empty' }
    const message = await channel.send({ embeds: [this.embed] })
    this._message = message
    this.addReactions(message)
    return { error: undefined }
  }

  private async addReactions(message: Message) {
    await message.react('⏮️')
    await message.react('⏸️')
    await message.react('⏭️')
    await message.react('🔁')
    await message.react('🔀')

    const filter = (reaction: MessageReaction, user: User) => {
      if (!reaction.emoji.name) return false
      return ['⏮️', '⏸️', '⏭️', '🔁', '🔀'].includes(reaction.emoji.name) && user.id !== server.config.botId
    }
    const collector = message.createReactionCollector({ filter })
    if (this._collector) this._collector.stop()
    this._collector = collector
    collector.on('collect', async (reaction, user) => {
      const validPrev = (this._currentQueue.actualIndex > 0) || this._currentQueue.isOnLoop
      const validNext = (this._currentQueue.actualIndex + 1 < this._currentQueue.length) || this._currentQueue.isOnLoop
      const isShuffle = this._currentQueue.shuffle.isShuffle

      if (reaction.emoji.name === '⏮️') {
        if (isShuffle) await this._currentQueue.shuffle.prevShuffleIndex()
        else if (validPrev) this._currentQueue.prevIndex()
      }
      if (reaction.emoji.name === '⏸️') {
        this._currentQueue.pause(!this._currentQueue.isPaused)
      }
      if (reaction.emoji.name === '⏭️') {
        if (isShuffle) await this._currentQueue.shuffle.nextShuffleIndex()
        else if (validNext) this._currentQueue.nextIndex()
      }
      if (reaction.emoji.name === '🔁') {
        this._currentQueue.loop(!this._currentQueue.isOnLoop)
      }
      if (reaction.emoji.name === '🔀') {
        this._currentQueue.shuffle.isShuffle = !this._currentQueue.shuffle.isShuffle
      }
      reaction.users.remove(user.id)
    })
  }

  // Getters ans Setters

  get embed() {
    const { author, title, url, image } = this._currentQueue.queue[this._currentQueue.index]
    const shuffleMode = this._currentQueue.shuffle.isShuffle ? 'shuffle on' : ''
    const loopMode = this._currentQueue.isOnLoop ? `${shuffleMode ? '\n' : ''}loop on` : ''
    return new MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`Current playing Song ${this._currentQueue.actualIndex + 1} from ${author}`)
      .setTitle(title)
      .setURL(url)
      .setThumbnail(
        image ||
        'https://cdn.discordapp.com/attachments/780268482519892009/823628073782083594/83372180_p0_master1200.png'
      )
      .setFooter(`${shuffleMode}${loopMode}`)
  }
}
