import { Message } from 'discord.js'
import { clearStatus, setStatus } from './admin/status'
import { deleteMessage, sendMessage } from './admin/message'
import { hasCommands } from '../utils/utils'
import { server } from '../bot'

export const isAdminCommand = async (message: Message) => {
  const configData = server.config
  const { content, channel, author } = message
  const { prefix, adminCommands, admins } = configData!

  const id = admins.find(id => id === author.id)

  const command = hasCommands(adminCommands, content, prefix, message => {
    if (id) channel.send(message)
    return true
  })

  if (command) {
    if (!id) {
      channel.send("You don't have the authority for this, baka!")
      return true
    }
  }

  if (command) {
    await handleAdminCommands(message, command as Icommand)
    return true
  }
  return false
}

const handleAdminCommands = async (message: Message, { commands }: Icommand) => {
  switch (commands[0]) {
    case 'setstatus':
      await setStatus(message)
      break
    case 'clearstatus':
      await clearStatus(message)
      break
    case 'sendmessage':
      sendMessage(message)
      break
    case 'deletemessage':
      deleteMessage(message)
      break
  }
}
