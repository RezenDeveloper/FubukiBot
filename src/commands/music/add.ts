import { ChannelType, GuildMember } from "discord.js"

const add: InteractionResponse = (interaction) => {
  const member = interaction.member as GuildMember
  if(!member) {
    interaction.reply(`Sorry ${interaction.user.displayName}, can't do that on this channel`)
    return
  }
  
  const memberChannel = member.voice.channel

  if(!memberChannel || memberChannel.type === ChannelType.GuildStageVoice) return
}

module.exports = {
  execute: add
}