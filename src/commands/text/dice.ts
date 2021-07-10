import { Message } from 'discord.js'
interface iRandomFubuki {
  name: string
  url: string
}

export const d100 = async (message: Message) => {
  const { channel } = message

  const dice = getDice(100)
  if (dice === 1) {
    channel.send(`${dice} :TanjiroHMMWTF:`)
  } else {
    if (dice == 100) {
      channel.send(`${dice}! すごい!!`)
    } else {
      channel.send(dice)
    }
  }
}
export const d20 = async (message: Message) => {
  const { channel } = message

  const dice = getDice(20)
  if (dice == 1) {
    channel.send(`Uhh... ${dice}`)
  } else {
    if (dice == 20) {
      channel.send(`${dice}! おめでとう!!`)
    } else {
      channel.send(dice)
    }
  }
}

export const getDice = (number: number) => {
  return Math.floor(Math.random() * number + 1)
}
