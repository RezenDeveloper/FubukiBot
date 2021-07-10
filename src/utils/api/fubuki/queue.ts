import gql from 'graphql-tag'
import { SendError } from '../../utils'
import { apolloClient } from './fubuki'

export const updateQueue = async (serverId: string, queue: VideoApi[]) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!, $queue: [QueueInsertInput!]!) {
          updateFullQueue(serverId: $serverId, queue: $queue) {
            title
          }
        }
      `,
      variables: {
        serverId,
        queue,
      },
    })

    return data.updateFullQueue.length!! as Boolean
  } catch (error) {
    SendError('GraphQl updateQueue', error)
    return null
  }
}

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

export const getShuffleQueue = async (serverId: string) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!) {
          shuffleQueue(serverId: $serverId) {
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
      },
    })

    return data.shuffleQueue as VideoBd[]
  } catch (error) {
    console.log(error)
    return []
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
