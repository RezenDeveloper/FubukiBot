import gql from 'graphql-tag'
import { SendError } from '../../utils'
import { apolloClient } from './fubuki'

export const serverExists = async (serverId: string) => {
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query {
          getServer (
            serverId:"${serverId}"
          )
          {
            serverId
          }
        }
      `,
    })

    return data.getServer.serverId!! as Boolean
  } catch (error) {
    return false
  }
}

interface serverValues {
  serverIcon?: string | null
  serverName?: string
  channelName?: string
  channelId?: string
  index?: number
  paused?: boolean
  volume?: number
}

export const updateServer = async (serverId: string, variables: serverValues) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
          $serverId: String!
          $channelId: String
          $serverIcon: String
          $serverName: String
          $channelName: String
          $index: Int
          $paused: Boolean
          $volume: Float
        ) {
          updateServer(
            serverId: $serverId
            channelId: $channelId
            serverIcon: $serverIcon
            serverName: $serverName
            channelName: $channelName
            index: $index
            paused: $paused
            volume: $volume
          ) {
            serverId
          }
        }
      `,
      variables: {
        serverId,
        ...variables,
      },
    })

    return data.updateServer.serverId!! as Boolean
  } catch (error) {
    return null
  }
}

interface ServerInsertValues {
  serverId: string
  serverName: string
  serverIcon: string | null
  channelId: string
  channelName: string
}

export const insertServer = async (variables: ServerInsertValues) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
          $serverId: String!
          $serverName: String!
          $serverIcon: String
          $channelId: String!
          $channelName: String!
        ) {
          insertServer(
            serverId: $serverId
            serverName: $serverName
            serverIcon: $serverIcon
            channelId: $channelId
            channelName: $channelName
          ) {
            serverId
          }
        }
      `,
      variables,
    })

    return data.insertServer.serverId!! as Boolean
  } catch (error) {
    return null
  }
}

interface watchResponse {
  serverId: string
  type: 'PUSH_ONE_VIDEO' | 'PLAY_ONE_VIDEO'
  channel: Channel
}

export const watchServer = async (serverId: string, onNext: (data: watchResponse) => void) => {
  try {
    return await apolloClient
      .subscribe({
        query: gql`
          subscription ($serverId: String!) {
            watchServerFromBot(serverId: $serverId) {
              serverId
              type
              channel {
                queue {
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
                queueLenght
                lastPage
                page
                controls {
                  play
                  paused
                  index
                  volume
                }
              }
            }
          }
        `,
        variables: {
          serverId,
        },
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return
          onNext(data.watchServerFromBot as watchResponse)
        },
        error: e => SendError('watchServer', e),
      })
  } catch (error) {
    SendError('watchServer', error)
  }
}
