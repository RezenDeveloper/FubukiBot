import { gql } from 'graphql-tag'
import { SendError } from '../../utils'
import { apolloClient } from './fubuki'

export const updateUserChannel = async (userId: string, channelId: string) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation ($userId: String!, $channelId: String!) {
          updateUserChannel(userId: $userId, currentChannel: $channelId) {
            userId
          }
        }
      `,
      variables: {
        userId,
        channelId,
      },
    })
    return {
      updated: true,
    }
  } catch (error) {
    SendError('updateUser', error)
    return {
      updated: false,
    }
  }
}
