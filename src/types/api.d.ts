interface Music {
  title: string
  url: string
  description: string
  image?: string
  seconds: number
  publishedAt: string
  author: string
  isLive: boolean
  status: string
  index: number
}

interface Playlist {
  title: string
  description: string
  author: string
  status: string
  image: string
  itemCount: number
}

type SubscriptionTypes = 'PUSH_ONE_VIDEO' | 'PLAY_ONE_VIDEO' | 'PLAY_PLAYLIST' | 'PUSH_PLAYLIST' | 'UPDATE_CONTROLS'

interface ChannelSubscription {
  page: number | null
  queueLenght: number | null
  lastPage: boolean | null
  controls: {
    play: boolean | null
    paused: boolean | null
    index: number | null
    volume: number | null
  } | null
}
