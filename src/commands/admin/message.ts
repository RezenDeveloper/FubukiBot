import { Channel, Message } from 'discord.js'
import { client, server } from './../../bot'
import { getCheckEmote, getErrorEmote } from '../../utils/utils'

export const sendMessage = async (message: Message) => {
  const { content, channel } = message

  const contentArray = content.split(' ')
  const [_, id, text] = contentArray

  const send = (sendChannel: Channel | undefined) => {
    if (!sendChannel) {
      channel.send('Sorry, i could not find a channel with this id')
      message.react(getErrorEmote())
      return
    }
    if (!sendChannel.isText()) {
      channel.send('This is not a valid channel')
      message.react(getErrorEmote())
      return
    }
    sendChannel.send(text)
    message.react(getCheckEmote())
  }

  if (!id || !text) {
    channel.send(`Wrong sentence. Try ${server.config.prefix}sendMessage (channelID) (message)`)
    message.react(getErrorEmote())
    return
  }
  if (parseFloat(id) !== NaN && id.length === 18) {
    const sendChannel = client.channels.cache.get(id)
    send(sendChannel)
  } else {
    channel.send('This is not a valid channel ID')
    message.react(getErrorEmote())
    return
  }
}

export const deleteMessage = async (message: Message) => {
  const { content, channel } = message

  const contentArray = content.split(' ')
  const [_, messageId, channelId] = contentArray

  if (!messageId || !channelId) {
    channel.send(`Wrong sentence. Try ${server.config.prefix}deleteMessage (messageID) (channelID)`)
    message.react(getErrorEmote())
    return
  }
  let sendChannel: Channel | undefined
  if (parseFloat(channelId) !== NaN && channelId.length === 18) {
    sendChannel = client.channels.cache.get(channelId)
  } else {
    channel.send('This is not a valid channel ID')
    message.react(getErrorEmote())
    return
  }
  if (!sendChannel) {
    channel.send('Sorry, i could not find a channel with this id')
    message.react(getErrorEmote())
    return
  }
  if (!sendChannel.isText()) {
    channel.send('This is not a valid channel')
    message.react(getErrorEmote())
    return
  }
  if (parseFloat(messageId) !== NaN && messageId.length === 18) {
    const messageData = await sendChannel.messages.fetch()
    const msgToDelete = messageData.find((value, key, collection) => {
      return key === messageId
    })
    if (msgToDelete) {
      if (msgToDelete.deletable) {
        msgToDelete.delete()
        message.react(getCheckEmote())
      } else {
        channel.send(`I can't delete this message`)
        message.react(getErrorEmote())
      }
    } else {
      channel.send(`I couldn't find a message with this id`)
      message.react(getErrorEmote())
    }
  }
}
