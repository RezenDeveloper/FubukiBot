import { DMChannel, Message, NewsChannel, TextBasedChannels, TextChannel } from 'discord.js'
import type { QueueClass } from '../classes/queueClass'
import { getCheckEmote, getErrorEmote, getPlaylistId, SendError, sendErrorMessage } from '../../utils/utils'
import ytdl from 'ytdl-core'
import { playCurrentMusic } from './playCurrentMusic'
import { URL } from 'url'
import { insertOneVideo, insertPlaylist, insertSearchVideo } from '../../utils/api/fubuki/queue'

export const play = async (message: Message, currentQueue: QueueClass, add?: boolean) => {
  const { content, channel } = message

  const searchParam = content.split(' ')[1]

  const playlistId = getPlaylistId(searchParam)

  //Is a playlist link
  if (playlistId) {
    const data = await insertPlaylist(message.guild!.id, searchParam, add)
    if (!data) return sendErrorMessage(channel as TextChannel)
    const { title, author, itemCount } = data

    channel.send(`${add ? 'Added' : 'Playing'} the playlist **${title}**\nFrom ${author} with ${itemCount} songs!`)
    message.react(getCheckEmote())
  }
  //Is a valid url
  else if (ytdl.validateURL(searchParam)) {
    const data = await insertOneVideo(message.guild!.id, searchParam, add)
    if (!data) return sendErrorMessage(channel as TextChannel)
    const { title } = data

    sendTitle(channel, title, add ? 'Add' : 'Play')
    message.react(getCheckEmote())
  }
  //It's a search query
  else {
    const query = content.replace(content.split(' ')[0], '').trim()

    const data = await insertSearchVideo(message.guild!.id, query, add)
    if (!data) return sendErrorMessage(channel as TextChannel)
    const { title } = data

    sendTitle(channel, title, add ? 'Add' : 'Play')
    message.react(getCheckEmote())
  }
}

const sendTitle = (channel: TextBasedChannels, title: string, type: 'Play' | 'Add') => {
  if (type === 'Add') {
    channel.send(`**${title}** was added to the queue!`)
  }
  if (type === 'Play') {
    channel.send(`Playing: **${title}**`)
  }
}
