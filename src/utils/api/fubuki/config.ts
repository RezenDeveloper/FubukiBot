import gql from 'graphql-tag';
import { apolloClient, getToken } from "./fubuki"

export const getConfig = async () => {
  const { data } = await apolloClient.query({
    query: gql`
      query getConfig {
        getConfig{
          prefix
          botId
          adminCommands{
            name
            commands
            description
            needParam
            isHidden
          }
          textCommands{
            name
            description
            commands
            isHidden
            needParam
          }
          voiceCommands{
            name
            description
            commands
            needParam
            needVoice
          }
        }
      }
    `,
    context: {
      headers: {
        authorization: `Bearer ${await getToken()}`
      }
    }
  })
  return data.getConfig as Iconfig
}