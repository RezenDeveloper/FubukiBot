import { DMChannel, NewsChannel, TextChannel, VoiceChannel } from 'discord.js'
import { handleAsyncFunc, SendError, sendErrorMessage } from '../../utils/utils'
import { VoiceChannelClass } from './commandClasses'
import { playCurrentMusic } from '../voice/playCurrentMusic'
import Discord from 'discord.js'
import { insertServer, serverExists, updateServer, watchServer } from '../../utils/api/fubuki/server'
import { getQueueTitle, GET_QUEUE_TITLE, QueueControls, updateQueueControls } from '../../utils/api/fubuki/queue'
import { FieldsEmbed } from 'discord-paginationembed'
import { apolloClient } from '../../utils/api/fubuki/fubuki'
import gql from 'graphql-tag'
import { valueFromAST } from 'graphql'

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
  private queuePage: number
  private queueId: string

  constructor() {
    super()
    this.queue = []
    this.length = 0
    this.page = 0
    this.index = 0
    this.time = 0
    this.shuffle = false
    this.paused = super.getDispatcher?.paused !== undefined ? super.getDispatcher?.paused : false
    this.queuePage = 0
    this.queueId = ''
  }

  //DataBase

  startWatch = async () => {
    const serverId = super.getChannel!.guild.id
    const channelId = super.getChannel!.id
    console.log('watching')
    super.setSubscription = await watchServer(serverId, async ({ channel, type }) => {
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
          super.pause(paused)
          this.paused = paused
        }
        if (volume !== null) this.setVolume = volume

        const playable = play || firstVideo
        if (playable) {
          this.queue = queue
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

  shuffleMode = (shuffle: boolean) => {
    this.shuffle = shuffle
    playCurrentMusic(this)
  }

  clearQueue = () => {
    this.queue = []
    this.index = 0
    this.length = 0
    this.page = 0
    this.endDispatcher()
  }

  //Index
  set setIndex(index: number) {
    if (index < this.length && this.length !== 0) {
      this.updateControls({ index })
    }
  }

  nextIndex() {
    this.updateControls({ index: this.getActualIndex() + 1 })
  }

  prevIndex() {
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
    super.pause(paused)
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
      messageEmbed.edit(this.getCurrentEmbed())
    }
  }

  getCurrentEmbed() {
    const { author, title, url, image } = this.queue[this.index]
    this.currentEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setAuthor(`Current playing Song ${this.getActualIndex() + 1} from ${author}`)
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
    QueueEmbed.build()
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
