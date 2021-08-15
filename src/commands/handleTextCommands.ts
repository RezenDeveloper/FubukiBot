import { Message } from 'discord.js'
import { server } from '../bot'
import { hasCommands } from '../utils/utils'
import { help, avatar, d100, getDice, d20, sauce } from './text/getTextCommands'

export const isTextCommand = async (message: Message) => {
  const configData = server.config
  const { content, channel } = message
  const { prefix, textCommands } = configData!
  let errorMessage = false

  const command = hasCommands(textCommands, content, prefix, message => {
    channel.send(message)
    errorMessage = true
  })
  if (command) {
    await handleTextCommands(message, command as Icommand)
    return true
  } else if (errorMessage) {
    return true
  }
}

const handleTextCommands = async (message: Message, command: Icommand) => {
  const { channel } = message

  switch (command.commands[0]) {
    case 'help':
      help(message)
      break
    case 'avatar':
      avatar(message)
      break
    case 'd5':
      channel.send(getDice(5).toString())
      break
    case 'd20':
      d20(message)
      break
    case 'd100':
      d100(message)
      break
    case 'sauce':
      sauce(message)
      break
  }
}
