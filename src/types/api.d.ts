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

interface Channel {
  page: number
  queueLenght: number
  lastPage: boolean
  queue: Music[]
  controls: {
    play: boolean | null
    paused: boolean | null
    index: number | null
    volume: number | null
  } | null
}
