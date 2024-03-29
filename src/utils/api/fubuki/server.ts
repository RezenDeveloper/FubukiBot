import gql from 'graphql-tag'
import { SendError } from '../../utils'
import { apolloClient } from './fubuki'

export const updateServer = async (serverId: string, channelId: string) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!, $channelId: String!) {
          updateServerChannel(serverId: $serverId, channelId: $channelId) {
            serverId
          }
        }
      `,
      variables: {
        serverId,
        channelId,
      },
    })
    return {
      updated: true,
    }
  } catch (error: any) {
    SendError('updateServer', error)
    return {
      updated: false,
    }
  }
}

interface ServerInsertValues {
  serverId: string
  channelId: string
}

export const insertServer = async (variables: ServerInsertValues) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($serverId: String!, $channelId: String!) {
          insertServer(serverId: $serverId, channelId: $channelId) {
            serverId
          }
        }
      `,
      variables,
    })

    return {
      created: true,
    }
  } catch (error: any) {
    const exists = error.message.includes('already exists') as boolean

    if (exists) {
      return {
        exists,
      }
    }

    SendError('insertServer', error)
  }
}

interface watchResponse {
  serverId: string
  type: SubscriptionTypes
  channel: ChannelSubscription
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
                queueId
                queueLength
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
  } catch (error: any) {
    SendError('watchServer', error)
  }
}
