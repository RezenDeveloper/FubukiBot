import { ChannelType, GuildMember, ModalBuilder } from "discord.js"
import { joinVoiceChannel } from '@discordjs/voice'
import { getCurrentQueue } from "../../classes/QueueClass"

const add: InteractionResponse = async (interaction) => {
  const url = interaction.options.get('url')!.value
  const member = interaction.member as GuildMember
  await interaction.deferReply()

  if(!member) {
    interaction.reply(`Sorry ${interaction.user.displayName}, can't do that on this channel`)
    return
  }
  
  const memberChannel = member.voice.channel
  const currentQueue = getCurrentQueue(interaction.guild!.id)
  
  if(!memberChannel || memberChannel.type === ChannelType.GuildStageVoice) return

  if (!currentQueue.connection || (currentQueue.getChannel !== memberChannel)) {
    const connection = joinVoiceChannel({
      channelId: memberChannel.id,
      guildId: memberChannel.guild.id,
      adapterCreator: memberChannel.guild.voiceAdapterCreator,
    })
    connection.subscribe(currentQueue.player)
    currentQueue.setVoiceChannel(memberChannel)

    currentQueue.addVideo(url as string)
    currentQueue.playCurrent()
  }

  await interaction.editReply('Done!')

}

module.exports = {
  execute: add
}