import { Message, TextChannel } from 'discord.js'
// import { SearchVideo } from '../../utils/api/ytSearch';
import { FieldsEmbed } from 'discord-paginationembed'
import { getNickname, SendError, sendErrorMessage } from './../../utils/utils'
import { searchObj } from '../classes/commandClasses'
import { playCurrentMusic } from './playCurrentMusic'
import type { QueueClass } from '../classes/queueClass'
import { insertOneVideo, searchVideos } from '../../utils/api/fubuki/queue'

export const search = async (message: Message, currentQueue: QueueClass, waiting?: boolean) => {
  const { content, channel } = message
  const nick = await getNickname(message)

  if (waiting) {
    const searchQueue = searchObj.getSearchQueue

    if (/^([0-9]+,?\s*)+$/g.test(content)) {
      const numbers = content.split(',').map(value => Number(value.trim()))
      console.log(numbers)

      for (let arrayIndex = 0; arrayIndex < numbers.length; arrayIndex++) {
        const value = numbers[arrayIndex]
        const index = value - 1

        if (index > searchQueue.length) {
          channel.send(`${value} is not a valid number!`)
          return
        }
        const music = searchQueue[index]
        const push = currentQueue.length !== 0 && arrayIndex !== 0
        console.log('push', push)

        const data = await insertOneVideo(message.guild!.id, music.url!, push)
        if (!data) return

        if (push) channel.send(`**${data.title}** was added to the queue!`)
        else channel.send(`Playing: **${data.title}**`)

        console.log('added', data.title)
      }

      searchObj.setWaiting = false
      searchObj.setSearchQueue = []
    } else {
      channel.send(`Please send me a valid number ${nick}`)
      searchObj.setWaiting = false
    }
    return
  }

  const query = content.replace(content.split(' ')[0], '').trim()

  const result = await searchVideos(query)
  if (!result) return sendErrorMessage(channel as TextChannel)

  searchObj.setSearchQueue = result

  const SearchEmbed = new FieldsEmbed()
  SearchEmbed.embed.setColor('#0099ff')
  SearchEmbed.embed.setTitle('Search Results:')
  SearchEmbed.setChannel(channel as TextChannel)
  SearchEmbed.setElementsPerPage(10)
  SearchEmbed.setAuthorizedUsers([])
  SearchEmbed.setArray(result.map((_, index) => index))
  SearchEmbed.formatField('Musics', i => {
    const time = result[i as number].seconds
    const minutes = Math.floor(time / 60) > 1 ? Math.floor(time / 60) : '00'
    const hours = Math.floor(time / 3600) > 1 ? Math.floor(time / 3600) : '00'
    const seconds = time - Math.floor(time / 60) * 60
    return `**Song ${(i as number) + 1}** ${result[i as number].title} **${hours}:${minutes}:${seconds}**`
  })
  SearchEmbed.setDisabledNavigationEmojis(['delete', 'jump'])
  SearchEmbed.setTimeout(0)
  SearchEmbed.build()
  setTimeout(() => {
    channel.send(
      `What's the number of the sound that you want to play ${nick}? \nYou can choose more than one using commas`
    )
    searchObj.setWaiting = true
  }, 1500)
}
