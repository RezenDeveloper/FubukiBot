import { Message, TextChannel } from 'discord.js'
import { clearQueue } from '../../utils/api/fubuki/queue'
import { getCheckEmote, sendErrorMessage } from '../../utils/utils'

export const clear = async (message: Message) => {
  const data = await clearQueue(message.guild!.id)
  if (!data) return sendErrorMessage(message.channel as TextChannel)

  message.react(getCheckEmote(message))
}
