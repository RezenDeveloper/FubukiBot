import { MongoSearch } from "../database/bd"
import { EmojiResolvable, Message, User } from 'discord.js'
import { client } from '../bot'
import { URL } from 'url'
 
interface iNickname {
    id:string
    name:string
}

let result:iNickname[]

export const getDBConfig = async () => {
    const config:Iconfig[] = await MongoSearch('configs', {});
    return config[0]
}

export const hasCommands = (commandArray:Icommand[] | IcommandVoice[], content:string, prefix:string, sendError:(message:string) => void ):Icommand| IcommandVoice | undefined => {
    return commandArray.find(({ commands, needParam }) => {
        return commands.find((value) => {
            if(needParam){
                const splitArray = content.toLowerCase().split(' ')
                if(splitArray[0] === `${prefix}${value}`){
                    if(splitArray.length <= 1){ 
                        sendError('This command needs a parameter to work')
                    }
                    else {
                        return true
                    }
                }
            }
            else{
                if(content.toLowerCase() === `${prefix}${value}`){
                    return true
                }
            }
        })
    })
}

export const getNickname = async (author:User) => {
    const { id:authorId } = author
    result = result? result : await MongoSearch("nicknames", {})

    const nick = result.find( ({ id }) => {
        return id === authorId
    })
    return nick? nick.name : `${author.username}-san` 
}

export const getPlaylistId = (url:string) => {
	try{
		const id = new URL(url).searchParams.get('list')
		return id
	}
	catch(err){
		return undefined
	}
}

export const SendError = (from:string, error:Error) => {
    client.channels.fetch("766870745028493392").then((logChannel) => {
        if(logChannel.isText()){
            logChannel.send(`Error on --${from}--\n${error}`)
        }
    })
} 

export const setStatus = async (status:string, type:"LISTENING" | "PLAYING" | "STREAMING" | "WATCHING" | "CUSTOM_STATUS" | "COMPETING") => {
	try {
        await client.user!.setActivity(`${status}`, { type });
    } catch (err) {
        console.log(err)
    }
}
export const clearStatus = async () => {
    await client.user!.setActivity("");
}

export const getCheckEmote = (message:Message) => {
    let reactionEmoji:EmojiResolvable | undefined = message.guild!.emojis.cache.find(emoji => emoji.name === 'jojokay');
    return reactionEmoji = reactionEmoji? reactionEmoji : '☑️'
}

export const getErrorEmote = () => {
    return '❌'
}