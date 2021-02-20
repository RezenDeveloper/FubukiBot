import Discord, { Message } from 'discord.js'
import { config } from '../commandClasses'

export const help = async (message:Message) => {
    const { channel } = message
    const { prefix, voiceCommands, textCommands } = await config.getConfig

    const chatValues = textCommands.map(({description, name}) => {
        return `**${prefix}${name}** - ${description}\n`
    }).join('')
    const voiceValues = voiceCommands.map(({description, name}) => {
        return `**${prefix}${name}** - ${description}\n`
    }).join('')

    const HelpEmbed = new Discord.MessageEmbed();
    HelpEmbed.setColor("#0099ff");
    HelpEmbed.setTitle("Help");
    HelpEmbed.setDescription("Here is my command list:");
    HelpEmbed.addFields(
        { name: "Chat Commands", value: chatValues, inline: true },
        { name: "Voice Commands", value: voiceValues, inline: true },
    )
    channel.send(HelpEmbed);
} 