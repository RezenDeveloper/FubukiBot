import { TextChannel, WSEventType, Client } from 'discord.js'

import 'dotenv/config'
import { isTextCommand } from './commands/handleTextCommands'
import { isVoiceCommand, searchWaiting } from './commands/handleVoiceCommands'
import { isAdminCommand } from './commands/handleAdminCommands'
import { getCurrentQueue, updateCurrentQueue } from './commands/queueClass'
import { searchObj } from './commands/commandClasses'

import { handlePixivUrl } from './commands/text/pixivUrl'

import { getConfig } from './utils/api/fubuki/config'
import { updateUser } from './utils/api/fubuki/users'
import { sendErrorMessage } from './utils/utils'

const { TOKEN } = process.env
export const client = new Client()

type WsEvents = WSEventType & 'INTERACTION_CREATE'

client.once('ready', async () => {
  console.log('Ready!')
})

client.ws.on(
  'INTERACTION_CREATE' as WsEvents,
  async ({ data, channel_id, guild_id, member, user: userDm, id, token }: Interaction) => {
    if (!data) return
    if (userDm) {
      //DM
      return
    }

    const channel = (await client.channels.fetch(channel_id!)) as TextChannel
    const guild = await client.guilds.fetch(guild_id!)
    const user = await client.users.fetch(member!.user.id)
  }
)

client.on('message', async message => {
  const configData = await getConfig()
  if (!configData) return sendErrorMessage(message.channel as TextChannel)

  if (searchObj.getWaiting) return await searchWaiting(message)

  if (message.content.charAt(0) === configData.prefix) {
    if (await isTextCommand(message)) return
    if (await isVoiceCommand(message)) return
    if (await isAdminCommand(message)) return
  }

  handlePixivUrl(message)
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  const configData = await getConfig()
  if (!configData) return
  const serverId = oldState.guild.id || newState.guild.id
  const currentQueue = getCurrentQueue(serverId)

  const userId = newState.member?.user.id
  const currentChannel = newState.channelID || ''

  if (userId) {
    updateUser(userId, { currentChannel })
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
