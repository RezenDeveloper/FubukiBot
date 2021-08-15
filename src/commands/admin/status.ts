import { Message } from 'discord.js'
import { server } from '../../bot'
import { setStatus as setStatusUtils, clearStatus as clearStatusUtils, getCheckEmote } from './../../utils/utils'

type statusType = 'LISTENING' | 'PLAYING' | 'STREAMING' | 'WATCHING' | 'COMPETING'

export const setStatus = async (message: Message) => {
  const { content, channel } = message

  const contentArray = content.split(' ')
  const [_, type, status] = contentArray
  const statusArray = ['LISTENING', 'PLAYING', 'STREAMING', 'WATCHING', 'COMPETING']
  const statusList = statusArray.map(value => value.toLowerCase()).join(' or ')

  if (!type || !statusArray.includes(type.toUpperCase()) || !status) {
    channel.send(`Wrong sentence. Try ${server.config.prefix}setstatus (${statusList}) (status message)`)
    return
  } else {
    setStatusUtils(status, type.toUpperCase() as statusType)
    message.react(getCheckEmote())
  }
}

export const clearStatus = async (message: Message) => {
  await clearStatusUtils()
}
