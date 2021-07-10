import { Message, TextChannel } from 'discord.js'
// import { SearchVideo } from '../../utils/api/ytSearch';
import { FieldsEmbed } from 'discord-paginationembed'
import { getNickname, SendError } from './../../utils/utils'
import { searchObj } from './../commandClasses'
import { playCurrentMusic } from './playCurrentMusic'
import type { QueueClass } from '../queueClass'

export const search = async (message: Message, currentQueue: QueueClass, waiting?: boolean) => {
  const { content, channel, author } = message
  const nick = await getNickname(author)

  if (waiting) {
    const searchQueue = searchObj.getSearchQueue

    if (/^([0-9]+,?\s*)+$/g.test(content)) {
      const numbers = content.split(',')
      numbers.forEach(value => {
        const queue = currentQueue.getQueue
        const index = parseInt(value) - 1

        if (index > searchQueue.length) {
          channel.send(`${value} is not a valid number!`)
          return
        }
        const music = searchQueue[index]
        currentQueue.setQueue = [...queue, music]
        if (queue.length === 0) {
          playCurrentMusic(currentQueue)
          channel.send(`Playing the song: ${music.title}`)
        } else {
          channel.send(`Added ${music.title} to the queue`)
        }
        searchObj.setWaiting = false
        searchObj.setSearchQueue = []
      })
    } else {
      channel.send(`Please send me a valid number ${nick}`)
      searchObj.setWaiting = false
    }
    return
  }

  const search = content.replace(content.split(' ')[0], '')

  // SearchVideo(search).then( async ({ result }) => {
  //     searchObj.setSearchQueue = result

  //     const SearchEmbed = new FieldsEmbed()
  //     SearchEmbed.embed.setColor("#0099ff");
  //     SearchEmbed.embed.setTitle("Search Results:");
  //     SearchEmbed.setChannel(channel as TextChannel);
  //     SearchEmbed.setElementsPerPage(10);
  //     SearchEmbed.setAuthorizedUsers([]);
  //     SearchEmbed.setArray(
  //         result.map((_,index) => index)
  //     );
  //     SearchEmbed.formatField('Musics', (i) => {
  //         const time = result[i as number].seconds;
  //         const minutes = Math.floor(time/60) > 1? Math.floor(time/60):"00";
  //         const seconds = time-(Math.floor(time/60)*60);
  //         const hours = Math.floor(time / 3600) > 1? Math.floor(time / 3600) : "00";

  //         return `**Song ${(i as number+1)}** ${result[i as number].title} **${hours}:${minutes}:${seconds}**`
  //     });
  //     SearchEmbed.setDisabledNavigationEmojis(['delete','jump']);
  //     SearchEmbed.setTimeout(0);
  //     SearchEmbed.build()
  //     setTimeout(() => {
  //         channel.send(`What's the number of the sound that you want to play ${nick}? \nYou can choose more than one using commas`);
  //         searchObj.setWaiting = true;
  //     },1500)

  // }).catch(err => {
  //     SendError("SearchEmbed",err)
  // })
}
