import { ObjectId } from "mongodb";
import { MongoSearch } from "../database/bd"
import { User } from 'discord.js'

interface iNickname {
    id:string
    name:string
}

export const getConfig = async () => {
    const config:Iconfig[] = await MongoSearch('configs', {});
    return config[0]
}

export const hasCommands = (commandArray:Icommand[], content:string, prefix:string ):Icommand | undefined => {
    let command:Icommand | undefined = undefined
    commandArray.forEach(({ commands }, index) => {
        commands.forEach((value) => {
            if(content.toLowerCase().startsWith(`${prefix}${value}`)){
                command = commandArray[index]
            }
        })
    })
    return command!
}

export const getNickname = async (author:User) => {
    const { id } = author
    const result:iNickname[] = await MongoSearch("nicknames",{ id })
    return result[0].name
}