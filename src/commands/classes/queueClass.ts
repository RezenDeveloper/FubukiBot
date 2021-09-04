import { SendError } from '../../utils/utils'
import { VoiceChannelClass } from './commandClasses'
import { playCurrentMusic } from '../voice/playCurrentMusic'
import { watchServer } from '../../utils/api/fubuki/server'
import { GET_QUEUE_TITLE, QueueControls, updateQueueControls } from '../../utils/api/fubuki/queue'
import { apolloClient } from '../../utils/api/fubuki/fubuki'
import { AudioPlayerStatus } from '@discordjs/voice'
import { Shuffle } from './shuffle'
import { CurrentPlaying } from './currentPlaying'
import { QueueEmbed } from './queueEmbed'

const classArray: QueueClass[] = []
const serverIdArray: string[] = []

interface QueueEvents {
  hasIdle: boolean
}
export class QueueClass extends VoiceChannelClass {
  private _queue: Music[]
  private _index: number
  private _page: number
  private _time: number
  private _isPaused: boolean
  private _length: number
  private _queueId: string

  private _events: QueueEvents
  private _shuffle: Shuffle
  private _currentPlaying: CurrentPlaying
  private _queueEmbed: QueueEmbed

  constructor() {
    super()
    this._queue = []
    this._length = 0
    this._page = 0
    this._index = 0
    this._time = 0
    this._shuffle = new Shuffle(this)
    this._currentPlaying = new CurrentPlaying(this)
    this._queueEmbed = new QueueEmbed(this)
    this._isPaused = super.player.state.status === AudioPlayerStatus.Paused ? true : false
    this._queueId = ''
    this._events = {
      hasIdle: false,
    }
  }

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
        this._queue = queue
        !this.shuffle.isShuffle && this._queueEmbed.updateEmbed(queue, page)
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
          paused ? super.player.pause() : super.player.unpause()
          this._isPaused = paused
        }
        //if (volume !== null) resource.volume = volume

        const playable = play || firstVideo
        if (playable) {
          if (!this._isPaused) playCurrentMusic(this)
        }
      }

      this._currentPlaying.updateEmbed()
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
    console.log('queue cleaned')
  }

  nextIndex() {
    this.updateControls({ index: this.actualIndex + 1 })
  }

  prevIndex() {
    this.updateControls({ index: this.actualIndex - 1 })
  }

  pause(paused: boolean) {
    this.updateControls({ paused })
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

  get queueId() {
    return this._queueId
  }

  get queueEmbed() {
    return this._queueEmbed
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

  get isPaused() {
    return this._isPaused
  }

  get events() {
    return this._events
  }

  set events(events: QueueEvents) {
    this._events = events
  }

  get currentPlaying() {
    return this._currentPlaying
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
