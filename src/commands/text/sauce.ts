import { Message, MessageEmbed } from 'discord.js'
import { getAnime } from './../../utils/api/mal'
import {
  getDateString,
  getNickname,
  getErrorEmote,
  getCheckEmote,
  getMessageParams,
  truncate,
} from './../../utils/utils'

export const sauce = async (message: Message) => {
  const { channel, content, author } = message

  const search = getMessageParams(content)
  try {
    const data = (await getAnime(search, 1)) as MALAnime
    const {
      title,
      url,
      score,
      airing,
      aired,
      episodes,
      synopsis,
      members,
      image_url,
      type,
      rating,
      rank,
      source,
      studios,
    } = data
    const DateString = airing
      ? aired.from
        ? getDateString(new Date(aired.from))
        : '(undefined)'
      : aired.to
      ? getDateString(new Date(aired.to))
      : getDateString(new Date(aired.from))

    const SauceEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(title)
      .setDescription(`**Rank:** ${rank}`)
      .setURL(url)
      .setImage(image_url)
      .addFields(
        {
          name: 'Status',
          value: airing ? `Airing since ${DateString}` : `Completed on ${DateString}`,
        },
        {
          name: 'Synopsis',
          value: truncate(synopsis, 1024),
        },
        {
          name: 'Score',
          value: `${score}`,
          inline: true,
        },
        {
          name: 'Episodes',
          value: `${episodes}`,
          inline: true,
        },
        {
          name: 'Type',
          value: `${type}`,
          inline: true,
        },
        {
          name: 'Source',
          value: `${source}`,
          inline: true,
        },
        {
          name: 'Rating',
          value: `${rating}`,
          inline: true,
        },
        {
          name: 'Members',
          value: `${members.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
          inline: true,
        },
        {
          name: 'Studio(s)',
          value: studios.map(({ name }) => name).join(', '),
        }
      )
    channel.send(SauceEmbed)
    message.react(getCheckEmote(message))
  } catch (err) {
    channel.send(`Sorry ${await getNickname(message)}, there is something wrong with the MAL API, not my fault!`)
    message.react(getErrorEmote())
  }
}
