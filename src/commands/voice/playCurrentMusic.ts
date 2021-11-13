import ytdl, { Filter } from 'ytdl-core'
import { URL } from 'url'
import type { QueueClass } from '../classes/queueClass'
import { AudioPlayerError, AudioPlayerStatus, createAudioResource, VoiceConnectionStatus } from '@discordjs/voice'
import { SendError, sendErrorMessage } from '../../utils/utils'

const COOKIES = process.env.COOKIES

export const playCurrentMusic = async (currentQueue: QueueClass, retries = 0) => {
  const { connection, player } = currentQueue
  const queue = currentQueue.queue
  const index = currentQueue.index
  const { isLive, status, url: videoUrl } = queue[index]

  if (status === 'private') return (currentQueue.index = currentQueue.actualIndex + 1)

  const timeParam = new URL(videoUrl).searchParams.get('t')
  let time = currentQueue.time.toString()
  let filter: Filter = 'audio'

  if (currentQueue.isPaused) currentQueue.pause(false)
  currentQueue.currentPlaying.updateEmbed()

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

  player.removeAllListeners()

  player.on('error', (audioError) => {
    if (audioError.message === 'Status code: 403' && retries <= 5) {
      player.removeAllListeners(AudioPlayerStatus.Idle)
      setTimeout(() => {
        playCurrentMusic(currentQueue, retries + 1)
      }, 200)
      return
    }
    SendError('player after 5 retries', audioError)
    currentQueue.textChannel?.send({ content: `Sorry i can't play this song, skipping to the next one` })
  })

  player.on(AudioPlayerStatus.Idle, async () => {
    if (currentQueue.length === 0) return console.log('no queue')
    const newIndex = currentQueue.actualIndex + 1
    const lastIndex = currentQueue.actualIndex === (currentQueue.length - 1)

    if (currentQueue.shuffle.isShuffle) {
      const { error } = await currentQueue.shuffle.nextShuffleIndex()
      if (error) {
        console.log('last shuffle index')
        currentQueue.leaveIn(60, () => {
          currentQueue.textChannel?.send({ content: 'Leaving due to inativity' })
        })
      }
      return
    }

    if (lastIndex && currentQueue.isOnLoop) {
      currentQueue.index = 0
      return
    }

    if (newIndex < currentQueue.length) {
      console.log('newIndex', newIndex)
      currentQueue.index = newIndex
    } else {
      console.log('last index')
      currentQueue.leaveIn(60, () => {
        currentQueue.textChannel?.send({ content: 'Leaving due to inativity' })
      })
    }
  })

  player.on(AudioPlayerStatus.Playing, () => {
    currentQueue.clearLeaveTimeout()
  })

  const resource = createAudioResource(video)
  player.play(resource)
}
