import ytdl, { Filter } from 'ytdl-core'
import { URL } from 'url'
import type { QueueClass } from '../queueClass';

export const playCurrentMusic = (currentQueue:QueueClass) => {
    const connection = currentQueue.getConnection
    const queue = currentQueue.getQueue
    const index = currentQueue.getIndex
    let time = currentQueue.getTime.toString()
    let filter:Filter = "audio"

    const messageEmbed = currentQueue.getCurrentEmbedMessage()

    if(messageEmbed){
        messageEmbed.edit(currentQueue.getCurrentEmbed())
    }
    
    //console.log("index: "+index+" length: "+queue.length)
    //console.log('index++ '+ (index+1))
    
    const { isLive, title } = queue[index]
    const videoUrl = queue[index].url!
    const timeParam = new URL(videoUrl).searchParams.get("t")

    //para lives e timings específicos: filter=audio
	if(time === "0" && timeParam !== null){
        time = timeParam;
	}
	if(time === "0" && !timeParam && !isLive){
		filter = 'audioonly'
	}
    
    const stream = ytdl(videoUrl, { begin: `${time}s`, filter: filter, quality: 'highestaudio', highWaterMark: 1 << 25});
    const dispatcher = connection.play(stream)
    currentQueue.setDispatcher = dispatcher

    dispatcher.on('finish',() => {
        let newIndex = currentQueue.getIndex+1
        if(newIndex < currentQueue.getQueue.length){
            currentQueue.setIndex = newIndex
            playCurrentMusic(currentQueue)
        }
    })

}