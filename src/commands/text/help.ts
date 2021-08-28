import Discord, { Message } from 'discord.js'
import { server } from '../../bot'

export const help = async (message: Message) => {
  const { channel } = message
  const data = server.config

  const { prefix, voiceCommands, textCommands } = data

  const chatValues = textCommands
    .filter(value => !value.isHidden)
    .map(({ description, name }) => {
      return `**${prefix}${name}** - ${description}\n`
    })
    .join('')
  const voiceValues = voiceCommands
    .map(({ description, name }) => {
      return `**${prefix}${name}** - ${description}\n`
    })
    .join('')

  const HelpEmbed = new Discord.MessageEmbed()
  HelpEmbed.setColor('#0099ff')
  HelpEmbed.setTitle('Help')
  HelpEmbed.setDescription('Here is my command list:')
  HelpEmbed.addFields(
    { name: 'Chat Commands', value: chatValues, inline: true },
    { name: 'Voice Commands', value: voiceValues, inline: true }
  )
  channel.send({ embeds: [HelpEmbed] })
}
