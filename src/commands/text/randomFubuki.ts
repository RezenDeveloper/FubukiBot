import { Message } from 'discord.js'
import { getNickname } from '../../utils/utils'

interface iRandomFubuki {
    name:string,
    url:string
}

export const randomFubuki = async (message:Message) => {
    // const { channel, author } = message
    // const result:iRandomFubuki[] = await MongoSearch("randomfubuki", {});
    // const idurl = Math.floor(Math.random()*result.length);

    // channel.send("Here's your random Fubuki Shitpost "+ await getNickname(author) +" \n"+result[idurl].url);
}