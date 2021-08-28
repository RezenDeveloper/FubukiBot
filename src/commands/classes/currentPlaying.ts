import { Message, MessageEmbed, MessageReaction, TextBasedChannels, User } from 'discord.js'
import { server } from '../../bot'
import { QueueClass } from './queueClass'

export class CurrentPlaying {
  private _currentQueue: QueueClass
  private _message?: Message

  constructor(currentQueue: QueueClass) {
    this._currentQueue = currentQueue
  }

  updateEmbed() {
    if (!this._message) return
    this._message.edit({ embeds: [this.embed] })
  }

  async sendCurrentEmbed(channel: TextBasedChannels) {
    const message = await channel.send({ embeds: [this.embed] })
    this._message = message
    this.addReactions(message)
  }

  private async addReactions(message: Message) {
    await message.react('⏮️')
    await message.react('⏸️')
    await message.react('⏭️')

    const filter = (reaction: MessageReaction, user: User) => {
      if (!reaction.emoji.name) return false
      return ['⏮️', '⏸️', '⏭️'].includes(reaction.emoji.name) && user.id !== server.config.botId
    }
    const collector = message.createReactionCollector({ filter })
    collector.on('collect', (reaction, user) => {
      if (reaction.emoji.name === '⏮️') {
        this._currentQueue.prevIndex()
      }
      if (reaction.emoji.name === '⏸️') {
        this._currentQueue.pause(!this._currentQueue.isPaused)
      }
      if (reaction.emoji.name === '⏭️') {
        this._currentQueue.nextIndex()
      }
      reaction.users.remove(user.id)
    })
  }

  // Getters ans Setters

  get embed() {
    const { author, title, url, image } = this._currentQueue.queue[this._currentQueue.index]
    return new MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`Current playing Song ${this._currentQueue.actualIndex + 1} from ${author}`)
      .setTitle(title)
      .setURL(url)
      .setThumbnail(
        image ||
          'https://cdn.discordapp.com/attachments/780268482519892009/823628073782083594/83372180_p0_master1200.png'
      )
      .setFooter(this._currentQueue.shuffle.isShuffle ? 'shuffle mode' : '')
  }
}
