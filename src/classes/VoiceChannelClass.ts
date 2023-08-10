import { getVoiceConnection, createAudioPlayer, AudioPlayer } from '@discordjs/voice'
import { TextChannel, VoiceChannel } from 'discord.js'

export class VoiceChannelClass {
  private _channel?: VoiceChannel
  private _textChannel?: TextChannel
  private _player: AudioPlayer
  private _leaveTimeout?: NodeJS.Timeout

  constructor() {
    this._channel = undefined
    this._textChannel = undefined
    this._player = createAudioPlayer()
    this._leaveTimeout = undefined
    this._player.setMaxListeners(1)
  }

  get player() {
    return this._player
  }

  //Connection
  get connection() {
    if (!this._channel) return undefined
    return getVoiceConnection(this._channel.guild.id)
  }

  endConnection() {
    this.connection?.disconnect()
    this.connection?.destroy()
  }

  //Channel
  setVoiceChannel = (channel: VoiceChannel) => {
    this._channel = channel
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