import { Message, TextChannel } from 'discord.js'
import { sendErrorMessage } from './../../utils/utils'
import type { QueueClass } from '../classes/queueClass'
import { searchVideos } from '../../utils/api/fubuki/queue'
import { SearchEmbed } from '../classes/searchEmbed'

export const search = async (message: Message, currentQueue: QueueClass) => {
  const { content, channel } = message

  const query = content.replace(content.split(' ')[0], '').trim()

  const result = await searchVideos(query)
  if (!result) return sendErrorMessage(channel as TextChannel)

  const search = new SearchEmbed(result, currentQueue)
  search.sendEmbed(channel)
}
