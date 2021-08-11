import { DMChannel, MessageEmbed, NewsChannel, TextBasedChannels, TextChannel, VoiceChannel } from 'discord.js'
import { handleAsyncFunc, SendError, sendErrorMessage } from '../../utils/utils'
import { VoiceChannelClass } from './commandClasses'
import { playCurrentMusic } from '../voice/playCurrentMusic'
import Discord from 'discord.js'
import { insertServer, serverExists, updateServer, watchServer } from '../../utils/api/fubuki/server'
import { getQueueTitle, GET_QUEUE_TITLE, QueueControls, updateQueueControls } from '../../utils/api/fubuki/queue'
import { FieldsEmbed } from 'discord-paginationembed'
import { apolloClient } from '../../utils/api/fubuki/fubuki'
import { AudioPlayerStatus } from '@discordjs/voice'
import { Shuffle } from './shuffle'

const classArray: QueueClass[] = []
const serverIdArray: string[] = []

interface QueueEvents {
  hasIdle: boolean
}
export class QueueClass extends VoiceChannelClass {
  private _shuffle: Shuffle
  private currentEmbed?: Discord.MessageEmbed
  private currentEmbedMessage?: Discord.Message
  private _queue: Music[]
  private _index: number
  private _page: number
  private _time: number
  private _isPaused: boolean
  private _length: number
  private _queuePage: number
  private _queueId: string
  private _events: QueueEvents

  constructor() {
    super()
    this._queue = []
    this._length = 0
    this._page = 0
    this._index = 0
    this._time = 0
    this._shuffle = new Shuffle(this)
    this._isPaused = super.player.state.status === AudioPlayerStatus.Paused ? true : false
    this._queuePage = 0
    this._queueId = ''
    this._events = {
      hasIdle: false,
    }
  }

  //DataBase

  startWatch = async () => {
    const serverId = super.getChannel!.guild.id
    const channelId = super.getChannel!.id
    console.log('watching')
    super.subscription = await watchServer(serverId, async ({ channel, type }) => {
      //console.log({ type, channel })
      const firstVideo = this._queue.length === 0

      if (!channel) return
      const { queueLength, queueId, lastPage, page, controls, queue } = channel

      if (queue) {
        await apolloClient.cache.writeQuery({
          query: GET_QUEUE_TITLE,
          data: {
            getPagedQueue: {
              __typename: 'PagedQueue',
              queue,
              queueLength,
              lastPage,
              page,
            },
          },
          variables: {
            channelId,
            queueId,
            page,
          },
        })
        console.log('cache updated')
        this._queue = queue
      }

      this._queueId = queueId
      this._length = queueLength

      if (controls !== null) {
        const { index, paused, volume, play } = controls
        if (index !== null) {
          this._page = page
          this._index = index % 10
          this._time = 0
          if (page !== null) this._page = page
        }
        if (paused !== null) {
          super.player.pause(paused)
          this._isPaused = paused
        }
        //if (volume !== null) resource.volume = volume

        const playable = play || firstVideo
        if (playable) {
          if (!this._isPaused) playCurrentMusic(this)
        }
      }

      this.updateEmbed()
    })
  }

  updateControls = async (controls: QueueControls) => {
    const serverId = super.getChannel!.guild.id
    await updateQueueControls(serverId, { ...controls })
  }

  clearQueue = () => {
    this._queue = []
    this._index = 0
    this._length = 0
    this._page = 0
    this._shuffle.isShuffle = false
    super.player.stop()
  }

  nextIndex() {
    console.log('isShuffle', this.shuffle.isShuffle)
    if (this.shuffle.isShuffle) return this.shuffle.setShuffleIndex()
    console.log('passou')
    this.updateControls({ index: this.actualIndex + 1 })
  }

  prevIndex() {
    this.updateControls({ index: this.actualIndex - 1 })
  }

  updateEmbed() {
    const messageEmbed = this.currentEmbedMessage

    if (messageEmbed) {
      messageEmbed.edit({ embeds: [this.getCurrentEmbed()] })
    }
  }

  getCurrentEmbed() {
    const { author, title, url, image } = this._queue[this._index]
    this.currentEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`Current playing Song ${this.actualIndex + 1} from ${author}`)
      .setTitle(title)
      .setURL(url)
      .setThumbnail(
        image ||
          'https://cdn.discordapp.com/attachments/780268482519892009/823628073782083594/83372180_p0_master1200.png'
      )

    return this.currentEmbed
  }

  sendCurrentEmbed(channel: TextBasedChannels) {
    channel.send({ embeds: [this.getCurrentEmbed()] }).then(message => {
      this.currentEmbedMessage = message
    })
  }

  sendQueueEmbed(channel: TextChannel) {
    const QueueEmbed = new FieldsEmbed()
    this._queuePage = this._page
    QueueEmbed.embed.setColor('#0099ff')
    QueueEmbed.embed.setTitle('Current Queue')
    QueueEmbed.setChannel(channel)
    QueueEmbed.setElementsPerPage(10)
    QueueEmbed.setAuthorizedUsers([])
    QueueEmbed.setArray(this._queue)

    QueueEmbed.embed.setFooter(`Page ${this._page + 1} of ${Math.floor(this.length / 10) + 1}`)
    QueueEmbed.formatField('Musics', i => {
      const { index, title } = i as Music
      return `**Song ${index + 1}** -- ${title}`
    })
    QueueEmbed.setDisabledNavigationEmojis(['all'])
    QueueEmbed.setTimeout(0)
    QueueEmbed.setFunctionEmojis({
      '⬅️': async (user, instance) => {
        //console.log('queuePage', this.queuePage - 1)
        const data = await getQueueTitle(this.getChannel!.id, this._queueId, this._queuePage - 1)
        if (!data) return
        const { queue, page } = data
        this._queuePage--
        QueueEmbed.embed.setFooter(`Page ${page + 1} of ${Math.floor(this._length / 10) + 1}`)
        QueueEmbed.setArray(queue)
      },
      '➡️': async (user, instance) => {
        //console.log('queuePage', this.queuePage + 1)
        const data = await getQueueTitle(this.getChannel!.id, this._queueId, this._queuePage + 1)
        if (!data) return
        const { queue, page } = data
        this._queuePage++
        QueueEmbed.embed.setFooter(`Page ${page + 1} of ${Math.floor(this._length / 10) + 1}`)
        QueueEmbed.setArray(queue)
      },
    })
    //channel.send({ embeds: [QueueEmbed.embed] })
  }

  //Getters and Setters

  set index(index: number) {
    if (index < this._length && this._length !== 0) {
      this.updateControls({ index })
    }
  }

  get index() {
    return this._index
  }

  get actualIndex() {
    return this._index + this._page * 10
  }

  get queue() {
    return this._queue
  }

  get length() {
    return this._length
  }

  get shuffle() {
    return this._shuffle
  }

  get page() {
    return this._page
  }

  set time(time: number) {
    this._time = time
  }

  get time() {
    return this._time
  }

  set isPaused(paused: boolean) {
    super.player.pause(paused)
    this._isPaused = paused
  }

  get isPaused() {
    return this._isPaused
  }

  get events() {
    return this._events
  }

  set events(events: QueueEvents) {
    this._events = events
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
