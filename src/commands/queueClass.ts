import { DMChannel, NewsChannel, TextChannel, VoiceChannel } from "discord.js";
import { ChangeStream } from "mongodb";
import { SendError } from "../utils/utils";
import { VoiceChannelClass } from "./commandClasses";
import { playCurrentMusic } from './voice/playCurrentMusic';
import Discord from 'discord.js'
import { insertServer, serverExists, updateServer, watchServer } from "../utils/api/fubuki/server";
import { getShuffleQueue, updateQueue } from "../utils/api/fubuki/queue";

const classArray:QueueClass[] = []
const serverIdArray:string[] = []

export class QueueClass extends VoiceChannelClass{
    private queue:VideoBd[]
    private index:number
    private time:number
    private paused:boolean
    private currentEmbed?:Discord.MessageEmbed
    private currentEmbedMessage?:Discord.Message

    constructor() {
        super();
        this.queue = []
        this.index = 0
        this.time = 0
        this.paused = super.getDispatcher?.paused !== undefined? super.getDispatcher?.paused : false
    }

    //DataBase

    startWatch = async () => {
        const serverId = super.getChannel!.guild.id
        super.setSubscription = await watchServer(serverId, (data) => {

            if(data.queue !== null) this.queue = data.queue
            if(data.controls !== null){
                const { index, paused, volume, play } = data.controls
                if(volume !== null) super.setVolume = volume
                if(index !== null) this.index = index
                if(paused !== null) super.pause(paused)
                
                if(play && !this.paused){
                    playCurrentMusic(this)
                }
            }
            this.updateEmbed()
        })
    }

    insertBdChannel = async () => {
        const serverId = super.getChannel!.guild.id

        if(await serverExists(serverId)){
            await this.updateBdChannel()
            if(!super.getSubscription) await this.startWatch()
            return
        }

        const variables = {
            serverId: super.getChannel!.guild.id,
            serverName: super.getChannel!.guild.name,
            serverIcon: super.getChannel!.guild.iconURL(),
            channelId: super.getChannel!.id,
            channelName: super.getChannel!.name
        }

        await insertServer(variables)
        await updateQueue(serverId, this.queue)
        if(!super.getSubscription) await this.startWatch()
    }

    updateBdChannel = async () => {
        const serverId = super.getChannel!.guild.id
        const values = { 
            serverIcon: super.getChannel!.guild.iconURL(),
            serverName: super.getChannel!.guild.name,
            channelName: super.getChannel!.name,
            channelId: super.getChannel!.id,
            paused: this.paused,
            index: this.index,
            volume: this.getDispatcher?.volume!
        }

        await updateServer(serverId, values)
        await updateQueue(serverId, this.queue)
    }

    updateBdIndex = async () => {
        const serverId = super.getChannel!.guild.id
        const values = { index: this.index }

        await updateServer(serverId, values)
    }

    updateBdPaused = async () => {
        const serverId = super.getChannel!.guild.id
        const values = { paused: this.paused }

        await updateServer(serverId, values)
    }


    //Queue
    set setQueue(queue:VideoBd[]) {
        this.queue = queue
        this.insertBdChannel()
    }

    get getQueue(){
        return this.queue
    }

    async shuffleQueue(){
        const serverId = super.getChannel!.guild.id
        this.index = 0
        this.queue = await getShuffleQueue(serverId)
        playCurrentMusic(this)
    }

    clearQueue(){
        this.setIndex = 0
        this.setQueue = []
        this.setPaused = false
        if(super.getDispatcher !== undefined){
            super.endDispatcher()
        }
    }

    //Index
    set setIndex(index:number){
        if(index < this.queue.length && this.queue.length !== 0){
            this.index = index
            this.time = 0
            this.updateBdIndex()
        }
    }

    nextIndex(){
        this.index++
        this.time = 0
        this.updateBdIndex()
    }

    prevIndex(){
        this.index--
        this.time = 0
        this.updateBdIndex()
    }

    get getIndex(){
        return this.index
    }

    //Time
    set setTime(time:number){
        this.time = time
    }

    get getTime(){
        return this.time
    }

    //paused
    set setPaused(paused:boolean){
        this.paused = paused
        super.pause()
        this.updateBdPaused()
    }

    get isPaused(){ 
        return this.paused
    }

    //Functions
    updateEmbed(){
        const messageEmbed = this.currentEmbedMessage

        if(messageEmbed){
            messageEmbed.edit(this.getCurrentEmbed())
        }
    }

    getCurrentEmbed(){
        const { author, title, url, image} = this.queue[this.index]
        
        this.currentEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setAuthor(`Current playing Song ${this.index+1} from ${author}`)
        .setTitle(title)
        .setURL(url!)
        .setThumbnail(image || 'https://cdn.discordapp.com/attachments/780268482519892009/823628073782083594/83372180_p0_master1200.png')
        
        return this.currentEmbed
    }

    sendCurrentEmbed(channel:TextChannel | DMChannel | NewsChannel){
        channel.send(this.getCurrentEmbed()).then(message => {
            this.currentEmbedMessage = message
        })
    }
}

export const getCurrentQueue = (serverId:string) => {
    const index = serverIdArray.indexOf(serverId)
    if(index !== -1 ) return classArray[index]
    const currentQueue = new QueueClass()
    
    serverIdArray.push(serverId)
    classArray.push(currentQueue)
    return currentQueue
}

export const updateCurrentQueue = (serverId:string, newClass:QueueClass) => {
    const index = serverIdArray.indexOf(serverId)
    if(index === -1 ) return SendError('updateCurrentQueue', `could not find the serverId, ${serverId}`)
    classArray[index] = newClass
}