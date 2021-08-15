import { Message, MessageEmbed, TextBasedChannels } from 'discord.js'
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

  sendCurrentEmbed(channel: TextBasedChannels) {
    channel.send({ embeds: [this.embed] }).then(message => {
      this._message = message
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
