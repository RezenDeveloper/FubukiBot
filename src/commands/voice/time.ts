import { Message } from 'discord.js'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'
import { playCurrentMusic } from './playCurrentMusic'
import type { QueueClass } from '../classes/queueClass'

export const time = (message: Message, currentQueue: QueueClass) => {
  const { content, channel } = message
  const time = content.split(' ')[1]
  const template = new RegExp(/^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/)

  if (template.test(time)) {
    const hasMinutes = time.split(':').length === 2
    const hasHours = time.split(':').length === 3
    const seconds = hasHours ? time.split(':')[2] : hasMinutes ? time.split(':')[1] : time
    const minutes = hasHours ? time.split(':')[1] : hasMinutes ? time.split(':')[0] : '0'
    const hours = hasHours ? time.split(':')[0] : '0'

    const total = parseFloat(seconds) + parseFloat(minutes) * 60 + parseFloat(hours) * 60 * 60
    currentQueue.time = total
    channel.send('May not work to some videos, not my fault!')
    playCurrentMusic(currentQueue)
    message.react(getCheckEmote())
  } else {
    channel.send('Please send a valid time (HH:MM:SS)')
    message.react(getErrorEmote())
  }
}
