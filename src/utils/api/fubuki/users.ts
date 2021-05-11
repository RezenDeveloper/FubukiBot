import gql from 'graphql-tag';
import { apolloClient, getToken } from "./fubuki"

interface UserValues { 
  userId?: string
  name?: string
  nickName?: string
  currentChannel?: string
  identifier?: string
}

export const updateUser = async (userId:string, values:UserValues) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: gql`
        mutation (
          $userId:String!
          $name: String
          $nickName: String
          $currentChannel: String
          $identifier: String
        ){
          updateUserById (
            userId: $userId
            name: $name
            nickName: $nickName
            currentChannel: $currentChannel
            identifier: $identifier
          )
          {
            userId
          }
        }
      `,
      variables: {
        userId,
        ...values
      },
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      }
    })

    return data.updateUserById as { userId:string }

  } catch (error) {
    return null
  }
}

export const getUserNickName = async (userId:string) => {
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query {
          getUserById(
            userId:"${userId}"
          ){
            nickName
          }
        }
      `,
      context: {
        headers: {
          authorization: `Bearer ${await getToken()}`
        }
      }
    })

    return data.getUserById.nickName as string

  } catch (error) {
    return null
  }
}