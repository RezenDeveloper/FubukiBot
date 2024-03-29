import { getVoiceConnection, createAudioPlayer, AudioPlayer } from '@discordjs/voice'
import { TextChannel, VoiceChannel } from 'discord.js'
import { insertServer, updateServer } from '../../utils/api/fubuki/server'

export class VoiceChannelClass {
  private _channel?: VoiceChannel
  private _textChannel?: TextChannel
  private _player: AudioPlayer
  private _leaveTimeout?: NodeJS.Timeout
  private _subscription?: ZenObservable.Subscription
  private _lastFetch?: Date

  constructor() {
    this._channel = undefined
    this._textChannel = undefined
    this._player = createAudioPlayer()
    this._leaveTimeout = undefined
    this._lastFetch = undefined
    this._player.setMaxListeners(1)
  }

  //Subscription
  set subscription(subscription: ZenObservable.Subscription | undefined) {
    this._subscription = subscription
  }

  get subscription() {
    return this._subscription
  }

  get player() {
    return this._player
  }

  endSubscription() {
    if (!this._subscription) return
    this._subscription.unsubscribe()
    this._subscription = undefined
  }

  //Connection
  get connection() {
    if (!this._channel) return undefined
    return getVoiceConnection(this._channel.guild.id)
  }

  endConnection() {
    if (this._subscription) this.endSubscription()
    this.connection?.disconnect()
    this.connection?.destroy()
  }

  //Channel
  setChannel = (channel: VoiceChannel) => {
    const serverId = channel.guild.id
    const channelId = channel.id

    return insertServer({ serverId, channelId }).then(async data => {
      if (data?.created) console.log('server created')
      if (data?.exists) {
        const currentDate = new Date()
        if (this._lastFetch) {
          const diff = Math.round((currentDate.getTime() - this._lastFetch.getTime()) / (1000 * 60 * 60 * 24))
          // already fetched today
          if (diff < 1) return
        }
        const { updated } = await updateServer(serverId, channelId)
        if (updated) console.log('server updated')
        this._lastFetch = new Date()
      }
      this._channel = channel
    })
  }

  setTextChannel(channel: TextChannel) {
    this._textChannel = channel
  }

  get textChannel() {
    return this._textChannel
  }

  get getChannel() {
    return this._channel
  }

  //Timer
  get getLeaveTimeout() {
    return this._leaveTimeout
  }
  leaveIn(seconds: number, callback?: () => void) {
    this._leaveTimeout = setTimeout(() => {
      if (callback) callback()
      this.endConnection()
    }, seconds * 1000)
  }
  clearLeaveTimeout() {
    if (this._leaveTimeout) clearTimeout(this._leaveTimeout)
    this._leaveTimeout = undefined
  }

  // Listeners
}
