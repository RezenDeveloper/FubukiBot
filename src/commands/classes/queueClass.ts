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

const classArray: QueueClass[] = []
const serverIdArray: string[] = []
class ShuffleClass {
  private _shuffleList: number[]
  private _isShuffle: boolean
  private currentQueue: QueueClass

  constructor(currentQueue: QueueClass) {
    this._shuffleList = []
    this._isShuffle = false
    this.currentQueue = currentQueue
  }

  addToShuffleList = (index: number) => {
    this._shuffleList = [...this._shuffleList, index]
  }

  clearShuffleList = () => {
    this._shuffleList = []
  }

  get shuffleList() {
    return this._shuffleList
  }

  set isShuffle(shuffle: boolean) {
    this._isShuffle = shuffle
    if (!shuffle) this.clearShuffleList()
  }

  get isShuffle() {
    return this._isShuffle
  }

  getShuffleIndex = () => {
    const queueLenght = this.currentQueue.getLength
    let pass = false
    let index = 0

    if (this._shuffleList.length === queueLenght) this.clearShuffleList()

    while (!pass) {
      index = Math.floor(Math.random() * queueLenght)
      console.log('shuffle index', index)
      if (!this._shuffleList.includes(index)) {
        this.addToShuffleList(index)
        pass = true
      }
    }

    console.log({
      shuffleListLength: this._shuffleList.length,
      queueLenght,
    })

    this.currentQueue.setIndex = index
  }
}

export class QueueClass extends VoiceChannelClass {
  private shuffleClass: ShuffleClass
  private currentEmbed?: Discord.MessageEmbed
  private currentEmbedMessage?: Discord.Message
  private queue: Music[]
  private index: number
  private page: number
  private time: number
  private paused: boolean
  private length: number
  private queuePage: number
  private queueId: string

  constructor() {
    super()
    this.queue = []
    this.length = 0
    this.page = 0
    this.index = 0
    this.time = 0
    this.shuffleClass = new ShuffleClass(this)
    this.paused = super.player.state.status === AudioPlayerStatus.Paused ? true : false
    this.queuePage = 0
    this.queueId = ''
  }

  //DataBase

  startWatch = async () => {
    const serverId = super.getChannel!.guild.id
    const channelId = super.getChannel!.id
    console.log('watching')
    super.subscription = await watchServer(serverId, async ({ channel, type }) => {
      console.log({ type, channel })
      const firstVideo = this.queue.length === 0

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
        this.queue = queue
      }

      this.queueId = queueId
      this.length = queueLength

      if (controls !== null) {
        const { index, paused, volume, play } = controls
        if (index !== null) {
          this.page = page
          this.index = index % 10
          this.time = 0
          if (page !== null) this.page = page
        }
        if (paused !== null) {
          super.player.pause(paused)
          this.paused = paused
        }
        //if (volume !== null) resource.volume = volume

        const playable = play || firstVideo
        if (playable) {
          if (!this.paused) playCurrentMusic(this)
        }
      }

      this.updateEmbed()
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

  get shuffle() {
    return this.shuffleClass
  }

  clearQueue = () => {
    this.queue = []
    this.index = 0
    this.length = 0
    this.page = 0
    super.player.stop()
  }

  //Index
  set setIndex(index: number) {
    if (index < this.length && this.length !== 0) {
      this.updateControls({ index })
    }
  }

  nextIndex() {
    console.log('isShuffle', this.shuffle.isShuffle)
    if (this.shuffle.isShuffle) return this.shuffle.getShuffleIndex()
    this.updateControls({ index: this.getActualIndex() + 1 })
  }

  prevIndex() {
    if (this.shuffle.isShuffle) return this.shuffle.getShuffleIndex()
    this.updateControls({ index: this.getActualIndex() - 1 })
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
    super.player.pause(paused)
    this.paused = paused
  }

  get isPaused() {
    return this.paused
  }

  //Functions
  getActualIndex() {
    return this.index + this.page * 10
  }

  updateEmbed() {
    const messageEmbed = this.currentEmbedMessage

    if (messageEmbed) {
      messageEmbed.edit({ embeds: [this.getCurrentEmbed()] })
    }
  }

  getCurrentEmbed() {
    const { author, title, url, image } = this.queue[this.index]
    this.currentEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`Current playing Song ${this.getActualIndex() + 1} from ${author}`)
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
    this.queuePage = this.page
    QueueEmbed.embed.setColor('#0099ff')
    QueueEmbed.embed.setTitle('Current Queue')
    QueueEmbed.setChannel(channel)
    QueueEmbed.setElementsPerPage(10)
    QueueEmbed.setAuthorizedUsers([])
    QueueEmbed.setArray(this.queue)

    QueueEmbed.embed.setFooter(`Page ${this.page + 1} of ${Math.floor(this.getLength / 10) + 1}`)
    QueueEmbed.formatField('Musics', i => {
      const { index, title } = i as Music
      return `**Song ${index + 1}** -- ${title}`
    })
    QueueEmbed.setDisabledNavigationEmojis(['all'])
    QueueEmbed.setTimeout(0)
    QueueEmbed.setFunctionEmojis({
      '⬅️': async (user, instance) => {
        //console.log('queuePage', this.queuePage - 1)
        const data = await getQueueTitle(this.getChannel!.id, this.queueId, this.queuePage - 1)
        if (!data) return
        const { queue, page } = data
        this.queuePage--
        QueueEmbed.embed.setFooter(`Page ${page + 1} of ${Math.floor(this.length / 10) + 1}`)
        QueueEmbed.setArray(queue)
      },
      '➡️': async (user, instance) => {
        //console.log('queuePage', this.queuePage + 1)
        const data = await getQueueTitle(this.getChannel!.id, this.queueId, this.queuePage + 1)
        if (!data) return
        const { queue, page } = data
        this.queuePage++
        QueueEmbed.embed.setFooter(`Page ${page + 1} of ${Math.floor(this.length / 10) + 1}`)
        QueueEmbed.setArray(queue)
      },
    })
    console.log(QueueEmbed.embed.fields[0].value)
    //channel.send({ embeds: [QueueEmbed.embed] })
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
