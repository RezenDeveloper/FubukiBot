import ytdl, { Filter } from 'ytdl-core'
import { VoiceChannelClass } from './VoiceChannelClass'
import { AudioPlayerStatus, createAudioResource } from '@discordjs/voice'

const classArray: QueueClass[] = []
const serverIdArray: string[] = []

interface QueueEvents {
  hasIdle: boolean
}
export class QueueClass extends VoiceChannelClass {
  private _videos: any[]
  private _index: number
  private _page: number
  private _time: number
  private _isOnLoop: boolean
  private _isPaused: boolean
  private _length: number
  private _queueId: string

  private _events: QueueEvents

  constructor() {
    super()
    this._videos = []
    this._length = 0
    this._page = 0
    this._index = 0
    this._time = 0
    this._isOnLoop = false
    this._isPaused = super.player.state.status === AudioPlayerStatus.Paused ? true : false
    this._queueId = ''
    this._events = {
      hasIdle: false,
    }
  }

  playCurrent = async () => {
    const {url: videoUrl } = this.videos[this.index]
  
    const timeParam = new URL(videoUrl).searchParams.get('t')
    let time = this.time.toString()
    let filter: Filter = 'audio'
  
    if (this.isPaused) this.pause(false)
  
    if (time === '0' && timeParam !== null) {
      time = timeParam
    }
    if (time === '0' && !timeParam) {
      filter = 'audioonly'
    }
    
    let info = await ytdl.getInfo(videoUrl);

    const video = ytdl(videoUrl, {
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    })

    this.player.removeAllListeners()

    this.player.on('error', (audioError) => {
      console.log(audioError)
      this.textChannel?.send({ content: `Sorry i can't play this song, skipping to the next one` })
    })
  
    this.player.on(AudioPlayerStatus.Idle, async () => {
      if (this.length === 0) return console.log('no queue')
      const newIndex = this.actualIndex + 1
      const lastIndex = this.actualIndex === (this.length - 1)
  
      if (lastIndex && this.isOnLoop) {
        this.index = 0
        return
      }
  
      if (newIndex < this.length) {
        console.log('newIndex', newIndex)
        this.index = newIndex
      } else {
        console.log('last index')
        this.leaveIn(60, () => {
          this.textChannel?.send({ content: 'Leaving due to inativity' })
        })
      }
    })
  
    this.player.on(AudioPlayerStatus.Playing, (e) => {
      this.clearLeaveTimeout()
    })
  
    const resource = createAudioResource(video)
    
    this.player.play(resource)

    this.player.on('debug', (e) => {
      console.log(e)
    })
  }

  addVideo = (url: string) => {
    this._videos.push({ url })
  }

  clearQueue = () => {
    this._videos = []
    this._index = 0
    this._length = 0
    this._page = 0
    this._isOnLoop = false
    super.player.stop()
    console.log('queue cleaned')
  }

  nextIndex() {
    const lastIndex = this.actualIndex === (this.length - 1)
    if (lastIndex && this.isOnLoop) return this.index = 0
    // this.updateControls({ index: this.actualIndex + 1 })
  }

  prevIndex() {
    if (this.isOnLoop && this.actualIndex === 0) {
      // return this.updateControls({ index: this.length - 1 })
    }
    // this.updateControls({ index: this.actualIndex - 1 })
  }

  pause(paused: boolean) {
    // this.updateControls({ paused })
  }

  loop(isOnLoop: boolean) {
    this._isOnLoop = isOnLoop
  }

  //Getters and Setters

  set index(index: number) {
    if (index < this._length && this._length !== 0) {
      // this.updateControls({ index })
    }
  }

  get index() {
    return this._index
  }

  get actualIndex() {
    return this._index + this._page * 10
  }

  get videos() {
    return this._videos
  }

  get queueId() {
    return this._queueId
  }

  get length() {
    return this._length
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

  get isOnLoop() {
    return this._isOnLoop
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
  if (index === -1) return 
  classArray[index] = newClass
}