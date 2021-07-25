import { StreamDispatcher, VoiceChannel, VoiceConnection } from 'discord.js'
import { insertServer, updateServer } from '../../utils/api/fubuki/server'
import { SendError, truncate } from '../../utils/utils'

export class VoiceChannelClass {
  private channel?: VoiceChannel
  private connection?: VoiceConnection
  private dispatcher?: StreamDispatcher
  private leaveTimeout?: NodeJS.Timeout
  private subscription?: ZenObservable.Subscription
  private lastFetch?: Date

  constructor() {
    this.channel = undefined
    this.connection = undefined
    this.dispatcher = undefined
    this.leaveTimeout = undefined
    this.lastFetch = undefined
  }

  //Subscription
  set setSubscription(subscription: ZenObservable.Subscription | undefined) {
    this.subscription = subscription
  }

  get getSubscription() {
    return this.subscription
  }

  endSubscription() {
    if (!this.subscription) return
    this.subscription.unsubscribe()
    this.subscription = undefined
  }

  //Connection
  set setConnection(connection: VoiceConnection) {
    //if(this.connection) this.endConnection()
    this.connection = connection
    this.listenConnection()
  }
  get getConnection() {
    return this.connection!
  }
  endConnection() {
    if (this.dispatcher) this.endDispatcher()
    if (this.subscription) this.endSubscription()
    this.connection!.disconnect()
    this.connection = undefined
  }

  //Dispatcher
  set setDispatcher(dispatcher: StreamDispatcher) {
    if (this.dispatcher) this.endDispatcher()
    this.dispatcher = dispatcher
    this.listenDispatcher()
  }
  get getDispatcher() {
    return this.dispatcher
  }
  set setVolume(volume: number) {
    if (volume > 2 || volume < 0) return
    this.dispatcher?.setVolume(volume)
  }

  pause(setIsPaused?: boolean) {
    if (!this.dispatcher) return

    if (setIsPaused === undefined) {
      if (this.dispatcher.paused) this.dispatcher.resume()
      else this.dispatcher.pause()
    } else if (setIsPaused) this.dispatcher.pause()
    else this.dispatcher.resume()
  }

  endDispatcher() {
    if (!this.dispatcher) return
    this.dispatcher.destroy()
    this.dispatcher = undefined
  }

  //Channel
  setChannel = (channel: VoiceChannel) => {
    const serverId = channel.guild.id
    const channelId = channel.id

    insertServer({ serverId, channelId }).then(async data => {
      if (data?.created) console.log('server created')
      if (data?.exists) {
        const currentDate = new Date()
        if (this.lastFetch) {
          const diff = Math.round((currentDate.getTime() - this.lastFetch.getTime()) / (1000 * 60 * 60 * 24))
          // already fetched today
          if (diff < 1) return
        }
        const { updated } = await updateServer(serverId, channelId)
        if (updated) console.log('server updated')
        this.lastFetch = new Date()
      }
    })

    this.channel = channel
  }
  get getChannel() {
    return this.channel
  }

  //Timer
  get getLeaveTimeout() {
    return this.leaveTimeout
  }
  leaveIn(seconds: number) {
    this.leaveTimeout = setTimeout(() => {
      this.endConnection()
    }, seconds * 1000)
  }
  clearLeaveTimeout() {
    if (this.leaveTimeout) clearTimeout(this.leaveTimeout)
    this.leaveTimeout = undefined
  }

  //Listeners
  private listenConnection() {
    this.connection!.on('disconnect', () => {
      this.dispatcher?.destroy()
      this.connection = undefined
    })
  }
  private listenDispatcher() {
    this.dispatcher?.on('error', async err => {
      SendError('Dispatcher', err)
    })
  }
}
class SearchClass {
  private queue: VideoBd[] = []
  private waiting: boolean = false

  set setWaiting(waiting: boolean) {
    this.waiting = waiting
  }
  get getWaiting() {
    return this.waiting
  }
  set setSearchQueue(queue: VideoBd[]) {
    this.queue = queue
  }
  get getSearchQueue() {
    return this.queue
  }
}

export const searchObj = new SearchClass()
