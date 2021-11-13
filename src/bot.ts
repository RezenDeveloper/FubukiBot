import { TextChannel, Client, Intents } from 'discord.js'

import 'dotenv/config'
import { isTextCommand } from './commands/handleTextCommands'
import { isVoiceCommand } from './commands/handleVoiceCommands'
import { isAdminCommand } from './commands/handleAdminCommands'
import { getCurrentQueue, updateCurrentQueue } from './commands/classes/queueClass'

import { handlePixivUrl } from './commands/text/pixivUrl'

import { updateUserChannel } from './utils/api/fubuki/user'
import { sendErrorMessage } from './utils/utils'
import { Server } from './commands/classes/server'

const { TOKEN } = process.env
export const client = new Client({
  partials: [
    'CHANNEL'
  ],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGES
  ],
})

export const server = new Server()

client.on('ready', async () => {
  console.log('Ready!')
})

client.on('messageCreate', async message => {
  if (message.content === 'Something went wrong') return

  const configData = server.config
  if (!configData) return sendErrorMessage(message.channel as TextChannel)
  if (message.author.id === configData.botId) return

  if (message.content.charAt(0) === configData.prefix) {
    if (await isTextCommand(message)) return
    if (await isVoiceCommand(message)) return
    if (await isAdminCommand(message)) return
  }
  console.log('message')

  handlePixivUrl(message)
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  const configData = server.config
  const serverId = oldState.guild.id || newState.guild.id
  const currentQueue = getCurrentQueue(serverId)

  const userId = newState.member?.user.id
  const currentChannel = newState.channelId || ''

  if (userId) {
    updateUserChannel(userId, currentChannel)
  }

  if (currentQueue.getLeaveTimeout && currentQueue.getChannel?.id === currentChannel) {
    currentQueue.clearLeaveTimeout()
  }

  if (currentQueue.getChannel && !currentQueue.getLeaveTimeout) {
    const members = currentQueue.getChannel.members.map(value => value.user.id)
    if (!members.length) return

    if (members[0] === configData.botId) {
      currentQueue.leaveIn(60)
      updateCurrentQueue(serverId, currentQueue)
    }
  }
})

client.login(TOKEN)
