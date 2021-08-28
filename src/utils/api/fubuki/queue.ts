import gql from 'graphql-tag'
import { SendError } from '../../utils'
import { apolloClient } from './fubuki'

export const insertOneVideo = async (serverId: string, url: string, push = false) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!, $url: String!, $push: Boolean) {
          insertOneVideo(serverId: $serverId, url: $url, push: $push) {
            title
            url
            description
            image
            seconds
            publishedAt
            author
            isLive
            status
            index
          }
        }
      `,
      variables: {
        serverId,
        url,
        push,
      },
    })

    return data.insertOneVideo as Music
  } catch (error) {
    SendError('GraphQl insertOneVideo', error)
    return null
  }
}

export const insertPlaylist = async (serverId: string, url: string, push = false) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!, $url: String!, $push: Boolean) {
          insertPlaylist(serverId: $serverId, url: $url, push: $push) {
            title
            description
            author
            status
            image
            itemCount
          }
        }
      `,
      variables: {
        serverId,
        url,
        push,
      },
    })

    return data.insertPlaylist as Playlist
  } catch (error) {
    SendError('GraphQl insertPlaylist', error)
    return null
  }
}

export const insertSearchVideo = async (serverId: string, query: string, push = false) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!, $query: String!, $push: Boolean) {
          searchOneVideo(serverId: $serverId, query: $query, push: $push) {
            title
            url
            description
            image
            seconds
            publishedAt
            author
            isLive
            status
            index
          }
        }
      `,
      variables: {
        serverId,
        query,
        push,
      },
    })

    return data.searchOneVideo as Music
  } catch (error) {
    SendError('GraphQl insertSearchVideo', error)
    return null
  }
}

export const clearQueue = async (serverId: string) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!) {
          clearQueue(serverId: $serverId) {
            title
            url
            description
            image
            seconds
            publishedAt
            author
            isLive
            status
          }
        }
      `,
      variables: {
        serverId,
      },
    })

    return data.clearQueue as Music
  } catch (error) {
    SendError('GraphQl clearQueue', error)
    return null
  }
}

export interface QueueControls {
  index?: number
  volume?: number
  paused?: boolean
}

export const updateQueueControls = async (serverId: string, variables: QueueControls) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String, $paused: Boolean, $volume: Float, $index: Int) {
          updateControls(serverId: $serverId, paused: $paused, volume: $volume, index: $index) {
            index
            paused
            volume
          }
        }
      `,
      variables: {
        serverId,
        ...variables,
      },
    })

    return {
      updated: true,
    }
  } catch (error) {
    SendError('updateQueueControls', error)
    return {
      updated: false,
    }
  }
}

const GET_PAGED_QUEUE = gql`
  query ($channelId: String, $page: Int!) {
    getPagedQueue(channelId: $channelId, page: $page) {
      queue {
        __typename
        title
        url
        description
        image
        seconds
        publishedAt
        author
        isLive
        status
        index
      }
    }
  }
`
export const getQueuePage = async (channelId: string, page: number, refetch: boolean) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_PAGED_QUEUE,
      variables: {
        channelId,
        page,
      },
      fetchPolicy: refetch ? 'network-only' : 'cache-first',
    })
    console.log(refetch ? 'page fetched' : 'page fetched with cache')

    return data.getPagedQueue.queue as Music[]
  } catch (error) {
    SendError('getQueuePage', error)
    return null
  }
}

export const GET_QUEUE_TITLE = gql`
  query ($channelId: String, $queueId: String, $page: Int!) {
    getPagedQueue(channelId: $channelId, page: $page, queueId: $queueId) {
      queue {
        title
        index
      }
      queueLength
      lastPage
      page
    }
  }
`
export const getQueueTitle = async (channelId: string, queueId: string, page: number) => {
  try {
    const { data } = await apolloClient.query({
      query: GET_QUEUE_TITLE,
      variables: {
        channelId,
        page,
        queueId,
      },
    })
    interface Response {
      queue: {
        title: string
        index: number
      }[]
      queueLength: number
      lastPage: boolean
      page: number
    }

    return data.getPagedQueue as Response
  } catch (error) {
    if (error.graphQLErrors[0].message === 'INVALID_PAGE') return
    SendError('getQueueTitle', error)
    return null
  }
}

const SEARCH_VIDEOS = gql`
  query searchMusics($query: String!) {
    searchMusics(query: $query) {
      title
      url
      description
      image
      seconds
      publishedAt
      author
      isLive
      status
    }
  }
`

export const searchVideos = async (query: string) => {
  try {
    const { data } = await apolloClient.query({
      query: SEARCH_VIDEOS,
      variables: {
        query,
      },
    })
    return data.searchMusics as VideoApi[]
  } catch (error) {
    SendError('searchVideos', error)
    return null
  }
}
