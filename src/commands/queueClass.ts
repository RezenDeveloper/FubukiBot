import { DMChannel, NewsChannel, TextChannel, VoiceChannel } from 'discord.js'
import { ChangeStream } from 'mongodb'
import { SendError, sendErrorMessage } from '../utils/utils'
import { VoiceChannelClass } from './commandClasses'
import { playCurrentMusic } from './voice/playCurrentMusic'
import Discord from 'discord.js'
import { insertServer, serverExists, updateServer, watchServer } from '../utils/api/fubuki/server'
import { getQueuePage, QueueControls, updateQueueControls } from '../utils/api/fubuki/queue'

const classArray: QueueClass[] = []
const serverIdArray: string[] = []

export class QueueClass extends VoiceChannelClass {
  private shuffle: boolean
  private currentEmbed?: Discord.MessageEmbed
  private currentEmbedMessage?: Discord.Message
  private queue: Music[]
  private index: number
  private page: number
  private time: number
  private paused: boolean
  private length: number

  constructor() {
    super()
    this.queue = []
    this.length = 0
    this.page = 0
    this.index = 0
    this.time = 0
    this.shuffle = false
    this.paused = super.getDispatcher?.paused !== undefined ? super.getDispatcher?.paused : false
  }

  //DataBase

  startWatch = async () => {
    const serverId = super.getChannel!.guild.id
    const channelId = super.getChannel!.id
    console.log('watching')
    super.setSubscription = await watchServer(serverId, async ({ channel, type }) => {
      console.log({ type, channel })
      const firstVideo = this.queue.length === 0

      if (channel !== null) {
        const { queueLength, lastPage, page, controls } = channel

        if (page !== null) {
          const refetch = page === this.page && queueLength !== this.getLength
          const newQueue = await getQueuePage(channelId, page, refetch)

          this.page = page
          this.length = queueLength!

          if (!newQueue) return

          this.queue = newQueue
        }

        if (controls !== null) {
          const { index, paused, volume, play } = controls
          if (index !== null) {
            this.index = index % 10
            this.time = 0
            if (page !== null) this.page = page
          }
          if (paused !== null) this.paused = paused
          if (volume !== null) this.setVolume = volume

          const playable = play || firstVideo
          if (playable && !this.paused) playCurrentMusic(this)
        }

        this.updateEmbed()
      }
    })
  }

  updateControls = async (controls: QueueControls) => {
    const serverId = super.getChannel!.guild.id
    await updateQueueControls(serverId, { ...controls })
  }

  //Queue

  get getQueue() {
    return this.queue
  }

  get getLength() {
    return this.length
  }

  shuffleMode = (shuffle: boolean) => {
    this.shuffle = shuffle
    playCurrentMusic(this)
  }

  //Index
  set setIndex(index: number) {
    if (index < this.length && this.length !== 0) {
      this.updateControls({ index })
    }
  }

  nextIndex() {
    this.updateControls({ index: this.index + 1 })
  }

  prevIndex() {
    this.updateControls({ index: this.index - 1 })
  }

  get getIndex() {
    return this.index
  }

  get getPage() {
    return this.page
  }

  //Time
  set setTime(time: number) {
    this.time = time
  }

  get getTime() {
    return this.time
  }

  //paused
  set setPaused(paused: boolean) {
    this.updateControls({ paused: paused })
  }

  get isPaused() {
    return this.paused
  }

  //Functions
  updateEmbed() {
    const messageEmbed = this.currentEmbedMessage

    if (messageEmbed) {
      messageEmbed.edit(this.getCurrentEmbed())
    }
  }

  getCurrentEmbed() {
    const { author, title, url, image } = this.queue[this.index]

    this.currentEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`Current playing Song ${this.index + 1} from ${author}`)
      .setTitle(title)
      .setURL(url!)
      .setThumbnail(
        image ||
          'https://cdn.discordapp.com/attachments/780268482519892009/823628073782083594/83372180_p0_master1200.png'
      )

    return this.currentEmbed
  }

  sendCurrentEmbed(channel: TextChannel | DMChannel | NewsChannel) {
    channel.send(this.getCurrentEmbed()).then(message => {
      this.currentEmbedMessage = message
    })
  }
}

export const getCurrentQueue = (serverId: string) => {
  const index = serverIdArray.indexOf(serverId)
  if (index !== -1) return classArray[index]
  const currentQueue = new QueueClass()

  serverIdArray.push(serverId)
  classArray.push(currentQueue)
  return currentQueue
}

export const updateCurrentQueue = (serverId: string, newClass: QueueClass) => {
  const index = serverIdArray.indexOf(serverId)
  if (index === -1) return SendError('updateCurrentQueue', `could not find the serverId, ${serverId}`)
  classArray[index] = newClass
}
