import Discord, { Message } from 'discord.js'
import { data } from '../../bot'

export const avatar = (message:Message) => {
    const AvatarEmbed = new Discord.MessageEmbed();
    const { author, channel } = message
    const url = author.avatarURL()!.split('.webp')[0]+".png?size=1024";
    
    AvatarEmbed.setImage(url);
    channel.send(AvatarEmbed);
} 