import gql from 'graphql-tag';
import { apolloClient, getToken } from "./fubuki"

export const serverExists = async (serverId:string) => {
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
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      }
    })

    return data.getServer.serverId!! as Boolean

  } catch (error) {
    return false
  }
}

interface serverValues { 
  serverIcon?:string | null
  serverName?:string
  channelName?:string
  channelId?:string
  index?:number
  paused?:boolean
  volume?:number
}

export const updateServer = async (serverId:string, variables:serverValues) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
          $serverId:String!
          $channelId:String
          $serverIcon:String
          $serverName:String
          $channelName:String
          $index:Int
          $paused:Boolean
          $volume:Float
        ){
          updateServer (
            serverId: $serverId
            channelId: $channelId
            serverIcon: $serverIcon
            serverName: $serverName
            channelName: $channelName
            index: $index
            paused: $paused
            volume: $volume
          )
          {
            serverId
          }
        }
      `,
      variables: {
        serverId,
        ...variables
      },
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      }
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

export const insertServer = async (variables:ServerInsertValues) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
          $serverId: String!
          $serverName: String!
          $serverIcon: String
          $channelId: String!
          $channelName: String!
        ){
          insertServer (
            serverId: $serverId
            serverName: $serverName
            serverIcon: $serverIcon
            channelId: $channelId
            channelName: $channelName
          )
          {
            serverId
          }
        }
      `,
      variables,
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      },
    })

    return data.insertServer.serverId!! as Boolean

  } catch (error) {
    return null
  }
}

interface watchResponse {
  queue: VideoApi[]
  controls: {
    paused:boolean
    play:boolean
    index:number
    volume:number
  }
}

export const watchServer = async (serverId:string, onNext: (data:watchResponse) => void) => {
  try {
    return await apolloClient.subscribe({
      query: gql`
        subscription (
          $serverId: String!
        ){
          serverChanged(
            serverId: $serverId
          ){
            queue{
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
            controls{
              paused
              play
              index
              volume
            }
          }
        }
      `,
      variables: {
        serverId,
      }
    }).subscribe({ 
      next: ({ data }) => {
        if(!data) return
        onNext(data.serverChanged as watchResponse)
      },
      error: (e) => console.log(e),
    })
  } catch (error) {
    console.log(error)
  }
}