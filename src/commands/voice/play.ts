import { DMChannel, Message, NewsChannel, TextChannel } from 'discord.js'
import type { QueueClass } from '../queueClass'
import { getCheckEmote, getErrorEmote, getPlaylistId, SendError, sendErrorMessage } from '../../utils/utils'
import ytdl from 'ytdl-core'
import { playCurrentMusic } from './playCurrentMusic'
import { URL } from 'url'
import { insertOneVideo, insertPlaylist } from '../../utils/api/fubuki/queue'

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
    message.react(getCheckEmote(message))
  }
  //Is a valid url
  else if (ytdl.validateURL(searchParam)) {
    const data = await insertOneVideo(message.guild!.id, searchParam, add)
    if (!data) return sendErrorMessage(channel as TextChannel)
    const { title } = data

    sendTitle(channel, title, add ? 'Add' : 'Play')
    message.react(getCheckEmote(message))
  }
  //It's just a name
  else {
    const name = content.replace(content.split(' ')[0], '')
    // SearchVideo(name, 1).then(({result}) => {
    //     if(!result.length){
    //         channel.send(`Sorry, i couldn't find this video`)
    //         message.react(getErrorEmote())
    //         return
    //     }
    //     const { title } = result[0]
    //     //Add to the queue
    //     if(add && currentQueueArray.length !== 0){
    //         currentQueue.setQueue = [
    //             ...currentQueueArray,
    //             result[0]
    //         ]
    //         sendTitle(channel, title ,"Add")
    //         message.react(getCheckEmote(message))
    //     }
    //     //Start a new queue
    //     else{
    //         currentQueue.setIndex = 0;
    //         currentQueue.setQueue = result
    //         playCurrentMusic(currentQueue)
    //         sendTitle(channel, title, "Play")
    //         message.react(getCheckEmote(message))
    //     }
    // }).catch(err => SendError("SearchVideo",err))
  }
}

const sendTitle = (channel: TextChannel | DMChannel | NewsChannel, title: string, type: 'Play' | 'Add') => {
  if (type === 'Add') {
    channel.send(`**${title}** was added to the queue!`)
  }
  if (type === 'Play') {
    channel.send(`Playing: **${title}**`)
  }
}
