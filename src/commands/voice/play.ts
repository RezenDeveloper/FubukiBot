import { DMChannel, EmojiResolvable, Message, NewsChannel, TextChannel } from 'discord.js'
import { currentQueue } from '../commandClasses'
import { getCheckEmote, getErrorEmote, getPlaylistId, SendError } from '../../utils/utils'
import { SearchVideo, getVideoInfo, getPlaylist } from '../../utils/api/ytSearch' 
import ytdl from 'ytdl-core'
import { playCurrentMusic } from './playCurrentMusic';
import { URL } from 'url'

export const play = (message:Message, add?:boolean) => {
    const { content, channel } = message

    const searchParam = content.split(' ')[1];

    const playlistId = getPlaylistId(searchParam)
    const currentQueueArray = currentQueue.getQueue
    currentQueue.setIndex = 0;

    //Is a playlist link
    if(playlistId){
        const indexParam = new URL(searchParam).searchParams.get('index')
        let index = 0
        if(indexParam){
            index = parseFloat(indexParam)
        }
        currentQueue.setIndex = index

        getPlaylist(playlistId).then(({ items, title, author, itemCount }) => {
            //Add a playlist to the queue
            if(add && currentQueueArray.length !== 0){
                items.forEach(value => {
                    currentQueue.setQueue = [
                        ...currentQueue.getQueue,
                        value
                    ]
                });
            }
            //Start a new queue with the playlist
            else{
                currentQueue.setQueue = items
                playCurrentMusic()
            }
            channel.send(`Playing the playlist **${title}**\n From ${author} with ${itemCount} songs!`);
            message.react(getCheckEmote(message))
        }).catch(err => SendError("getPlaylist",err));
    }
    //Is a valid url
    else if(ytdl.validateURL(searchParam)){
        const id = ytdl.getVideoID(searchParam)
        getVideoInfo(id).then(result => {
            //Add to the queue
            if(add && currentQueueArray.length !== 0){
                currentQueue.setQueue = [
                    ...currentQueueArray,
                    {
                        ...result,
                        url:searchParam
                    }
                ]
            }
            //Start a new queue
            else{
                currentQueue.setQueue = [
                    {
                        ...result,
                        url:searchParam
                    }
                ]
                playCurrentMusic()
            }
            sendTitle(channel, result.title, add?"Add":"Play")
            message.react(getCheckEmote(message))
        }).catch(err => SendError("getVideoInfo",err))
    }
    //It's just a name
    else{
        const name = content.replace(content.split(' ')[0],'')
        SearchVideo(name, 1).then(({result}) => {
            if(!result.length){
                channel.send(`Sorry, i couldn't find this video`)
                message.react(getErrorEmote())
                return
            }
            const { title } = result[0]
            //Add to the queue
            if(add && currentQueueArray.length !== 0){
                currentQueue.setQueue = [
                    ...currentQueueArray,
                    result[0]
                ]
                sendTitle(channel, title ,"Add")
                message.react(getCheckEmote(message))
            }
            //Start a new queue
            else{
                currentQueue.setQueue = result
                playCurrentMusic()
                sendTitle(channel, title, "Play")
                message.react(getCheckEmote(message))
            }
        }).catch(err => SendError("SearchVideo",err))
    }
}

const sendTitle = (channel:TextChannel | DMChannel | NewsChannel, title:string, type:"Play"|"Add") => {
    if(type === "Add"){
        channel.send(`**${title}** was added to the queue!`);
    }
    if(type === "Play"){
        channel.send(`Playing: **${title}**`);
    }
}