import gql from 'graphql-tag';
import { apolloClient, getToken } from "./fubuki"

export const updateQueue = async (serverId:string, queue:VideoApi[]) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
            $serverId:String!
            $queue:[QueueInsertInput!]!
          ){
          updateFullQueue (
            serverId: $serverId
            queue: $queue
          )
          {
            title
          }
        }
      `,
      variables: {
        serverId,
        queue
      },
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      }
    })

    return data.updateFullQueue.length!! as Boolean

  } catch (error) {
    return null
  }
}

export const getShuffleQueue = async (serverId:string) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
            $serverId:String!
          ){
          shuffleQueue (
            serverId: $serverId
          )
          {
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
        serverId
      },
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      }
    })

    return data.shuffleQueue as VideoBd[]

  } catch (error) {
    console.log(error)
    return []
  }
}