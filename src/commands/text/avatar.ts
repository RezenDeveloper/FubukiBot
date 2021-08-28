import Discord, { Message } from 'discord.js'

export const avatar = async (message: Message) => {
  const AvatarEmbed = new Discord.MessageEmbed()
  const { author, channel } = message
  const url = author.avatarURL({ dynamic: true, size: 4096 })!

  AvatarEmbed.setImage(url)
  channel.send({ embeds: [AvatarEmbed] })
}
