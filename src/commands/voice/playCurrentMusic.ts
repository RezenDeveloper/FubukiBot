import ytdl, { Filter } from 'ytdl-core'
import { URL } from 'url'
import type { QueueClass } from '../classes/queueClass'
import { AudioPlayerStatus, createAudioResource, VoiceConnectionStatus } from '@discordjs/voice'

const COOKIES = process.env.COOKIES

export const playCurrentMusic = (currentQueue: QueueClass) => {
  const { connection, player } = currentQueue
  const queue = currentQueue.getQueue
  const index = currentQueue.getIndex
  const { isLive, status, url: videoUrl } = queue[index]

  if (status === 'private') return (currentQueue.setIndex = currentQueue.getActualIndex() + 1)

  const timeParam = new URL(videoUrl).searchParams.get('t')
  let time = currentQueue.getTime.toString()
  let filter: Filter = 'audio'

  if (currentQueue.isPaused) currentQueue.setPaused = false
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

  connection!.subscribe(player)

  player.on(AudioPlayerStatus.Idle, () => {
    const { isShuffle, getShuffleIndex } = currentQueue.shuffle
    if (isShuffle) return getShuffleIndex()

    const newIndex = currentQueue.getActualIndex() + 1
    if (newIndex < currentQueue.getLength) {
      console.log('newIndex', newIndex)
      currentQueue.setIndex = newIndex
    } else {
      console.log('last index')
    }
  })
}
