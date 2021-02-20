import { MongoSearch } from "../database/bd"
import { Channel, TextChannel, User } from 'discord.js'
import { client } from '../bot'
import { URL } from 'url'
 
interface iNickname {
    id:string
    name:string
}

let result:iNickname[]

export const getConfig = async () => {
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

export const setMusicStatus = async (title:string) => {
	await client.user!.setActivity(`${title}`, { type: 'LISTENING' });
}
export const clearMusicStatus = async () => {
    await client.user!.setActivity("");
}