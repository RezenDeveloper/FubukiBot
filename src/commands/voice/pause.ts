import { AudioPlayerStatus } from '@discordjs/voice'
import { Message } from 'discord.js'
import { getCheckEmote } from '../../utils/utils'
import type { QueueClass } from '../classes/queueClass'
import { getErrorEmote } from './../../utils/utils'

export const pause = async (message: Message, currentQueue: QueueClass) => {
  const { channel } = message
  const voiceChannel = currentQueue.getChannel
  const status = currentQueue.player.state.status

  if (status !== AudioPlayerStatus.Playing && status !== AudioPlayerStatus.Paused) {
    channel.send('There is nothing to pause!')
    message.react(getErrorEmote())
    return
  }
  if (voiceChannel) {
    if (currentQueue.isPaused) {
      currentQueue.pause(false)

      channel.send('<:Menacing:603270364314730526> Toki wa ugoki dasu! <:Menacing:603270364314730526>')
      message.react(getCheckEmote())
    } else {
      currentQueue.pause(true)

      channel.send('<:Menacing:603270364314730526> Toki wo Tomare! <:Menacing:603270364314730526>')
      message.react(getCheckEmote())
    }
  }
}
