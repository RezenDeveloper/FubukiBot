import ytdl, { Filter } from 'ytdl-core'
import { currentQueue, currentVoiceChannel } from '../commandClasses'
import { URL } from 'url'

export const playCurrentMusic = () => {
    const connection = currentVoiceChannel.getConnection
    const queue = currentQueue.getQueue
    let index = currentQueue.getIndex
    let time = currentQueue.getTime.toString()
    let filter:Filter = "audio"

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
    currentVoiceChannel.setDispatcher = dispatcher
    currentVoiceChannel.setMusicStatus = title

    dispatcher.on('finish',() => {
        index++
        if(index < currentQueue.getQueue.length){
            currentQueue.setIndex = index
            playCurrentMusic()
        }
    })

}