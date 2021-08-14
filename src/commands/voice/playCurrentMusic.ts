import ytdl, { Filter } from 'ytdl-core'
import { URL } from 'url'
import type { QueueClass } from '../classes/queueClass'
import { AudioPlayerStatus, createAudioResource, VoiceConnectionStatus } from '@discordjs/voice'

const COOKIES = process.env.COOKIES

export const playCurrentMusic = (currentQueue: QueueClass) => {
  const { connection, player } = currentQueue
  const queue = currentQueue.queue
  const index = currentQueue.index
  const { isLive, status, url: videoUrl } = queue[index]

  if (status === 'private') return (currentQueue.index = currentQueue.actualIndex + 1)

  const timeParam = new URL(videoUrl).searchParams.get('t')
  let time = currentQueue.time.toString()
  let filter: Filter = 'audio'

  if (currentQueue.isPaused) currentQueue.isPaused = false
  currentQueue.updateEmbed()

  //console.log("index: "+index+" length: "+queue.length)
  //console.log('index++ '+ (index+1))

  //for lives and specific timings: filter=audio
  if (time === '0' && timeParam !== null) {
    time = timeParam
  }
  if (time === '0' && !timeParam && !isLive) {
    filter = 'audioonly'
  }

  const video = ytdl(videoUrl, {
    begin: `${time}s`,
    filter,
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    requestOptions: {
      headers: {
        cookie: COOKIES,
      },
    },
  })

  player.play(createAudioResource(video))

  if (currentQueue.events.hasIdle) return
  currentQueue.events.hasIdle = true
  console.log('idle setted')
  player.on(AudioPlayerStatus.Idle, async () => {
    if (currentQueue.length === 0) return console.log('no queue')
    console.log('idle')
    const { isShuffle } = currentQueue.shuffle
    if (isShuffle) return await currentQueue.shuffle.nextShuffleIndex()

    const newIndex = currentQueue.actualIndex + 1
    if (newIndex < currentQueue.length) {
      console.log('newIndex', newIndex)
      currentQueue.index = newIndex
    } else {
      console.log('last index')
    }
  })
}
