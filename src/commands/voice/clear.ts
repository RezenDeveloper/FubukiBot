import { Message, TextChannel } from 'discord.js'
import { clearQueue } from '../../utils/api/fubuki/queue'
import { getCheckEmote, sendErrorMessage } from '../../utils/utils'
import { getCurrentQueue } from '../classes/queueClass'

export const clear = async (message: Message) => {
  const data = await clearQueue(message.guild!.id)
  if (!data) return sendErrorMessage(message.channel as TextChannel)
  getCurrentQueue(message.guild!.id).clearQueue()

  message.react(getCheckEmote())
}
