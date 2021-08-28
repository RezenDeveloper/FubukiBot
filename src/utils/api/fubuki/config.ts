import gql from 'graphql-tag'
import { SendError } from '../../utils'
import { apolloClient } from './fubuki'

export const getConfig = async () => {
  try {
    const { data } = await apolloClient.query({
      query: gql`
        query getConfig {
          getConfig {
            prefix
            botId
            admins
            adminCommands {
              name
              commands
              description
              needParam
              isHidden
            }
            textCommands {
              name
              description
              commands
              isHidden
              needParam
            }
            voiceCommands {
              name
              description
              commands
              needParam
              needVoice
            }
          }
        }
      `,
    })
    return data.getConfig as ServerConfig
  } catch (error) {
    SendError('getConfig', error)
    return null
  }
}
