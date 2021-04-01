import { DMChannel, NewsChannel, TextChannel, VoiceChannel } from "discord.js";
import { ChangeStream } from "mongodb";
import { MongoFindOne, MongoInsertOne, MongoUpdateOne, MongoWatch } from "../database/bd";
import { SendError } from "../utils/utils";
import { VoiceChannelClass } from "./commandClasses";
import { playCurrentMusic } from './voice/playCurrentMusic';
import Discord from 'discord.js'

const classArray:QueueClass[] = []
const serverIdArray:string[] = []

interface UpdatedFields { 
    volume?:number
    index?:number
    paused?:boolean 
    queue?:VideoBd[] 
}

export class QueueClass extends VoiceChannelClass{
    private queue:VideoBd[]
    private index:number
    private time:number
    private paused:boolean
    private eventChannel?:VoiceChannel
    private watchEvent?:ChangeStream<any>
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

    watchChannel = async () => {
        this.eventChannel = super.getChannel

        const serverId = super.getChannel!.guild.id

        const { watch, client } = await MongoWatch('voiceChannels', { 'fullDocument.serverId': serverId })
        this.watchEvent = watch

        this.watchEvent.on('change', (data:any) => {

            const { fullDocument, updateDescription } = data
            const { updatedFields } = updateDescription

            const { index:bdIndex, paused:bdPaused, queue:bdQueue, volume } = updatedFields as UpdatedFields

            if(fullDocument.shuffle){
                this.shuffleQueue()
                playCurrentMusic(this)
                MongoUpdateOne('voiceChannels', { serverId }, { shuffle:false })
            }
            if(volume){
                if(volume > 2 || volume < 0) return
                this.setVolume = volume
            }
            if(bdIndex !== undefined && bdIndex !== this.index) {
                this.index = bdIndex
                //console.log('new BdIndex',bdIndex)
                if(!fullDocument.play) return
                playCurrentMusic(this)
            }
            if(bdPaused !== undefined && bdPaused !== this.paused) {
                const dispatcher = super.getDispatcher
                if(dispatcher !== undefined){
                    if(bdPaused)
                        dispatcher.pause()
                    else dispatcher.resume()
                }
                this.paused = bdPaused
            }
            if(bdQueue !== undefined){
                this.queue = bdQueue.sort((a,b) => a.index! - b.index!)
            }
            if(/^queue\.\d{1,}\.index$/.test(Object.keys(updatedFields)[0])){
                const key = Object.keys(updatedFields)[0]

                const index = Number(key.split('.')[1])
                const { _id } = fullDocument.queue[index] as VideoBd
                const newValue = updatedFields[key]

                //console.log('_id:',_id ,'index:', index, 'newValue:',newValue)

                this.queue = this.queue.map((value) => {
                    if(value._id === _id) value.index = newValue
                    return value
                }).sort((a,b) => a.index! - b.index!)
            }
        })

        this.watchEvent.on('close', () => {
            client.close()
        })
    }

    insertBdChannel = async () => {
        
        const exists = await MongoFindOne('voiceChannels', { serverId: super.getChannel!.guild.id }, { serverId: 1 }) as { _id:string, serverId:string }
        
        if(exists){
            this.updateBdChannel()
            return
        }

        const newQueue = this.queue.map((value, i) => {
            return { ...value, index:i, _id:i }
        })

        const Channel:ChannelDetails = {
            serverId: super.getChannel!.guild.id,
            serverName: super.getChannel!.guild.name,
            serverIcon: super.getChannel!.guild.iconURL(),
            channelId: super.getChannel!.id,
            channelName: super.getChannel!.name,
            queue: newQueue,
            paused: false,
            play: true,
            shuffle: false,
            index: this.index,
            volume: this.getDispatcher?.volume!
        }

        try {

            await MongoInsertOne('voiceChannels', Channel)

        } catch (error) {
            console.log(error)
            SendError('insert BdQueue', error)
        }
    }

    updateBdChannel = async () => {

        try {
            const newQueue = this.queue.map((value, i,) => {
                return { 
                    ...value, 
                    index: value.index? value.index : i,
                    _id: value._id ? value._id : i 
                }
            })
            const filter = { serverId: super.getChannel!.guild.id }
            const value = { 
                serverIcon: super.getChannel!.guild.iconURL(),
                serverName: super.getChannel!.guild.name,
                channelName: super.getChannel!.name,
                channelId: super.getChannel!.id,
                queue: newQueue,
                index: this.index,
                play: true,
                shuffle: false,
                volume: this.getDispatcher?.volume!
            }
    
            await MongoUpdateOne('voiceChannels', filter, value)

        } catch (error) {
            console.log(error)
            SendError('update BdQueue', error)
        }
    }

    updateBdIndex = async () => {

        try {
            const filter = { serverId: super.getChannel!.guild.id }
            const value = { index: this.index, play: true }
    
            await MongoUpdateOne('voiceChannels', filter, value)
    
        } catch (error) {
            console.log(error)
            SendError('update BdIndex', error)
        }
    }

    updateBdPaused = async () => {

        try {
            const filter = { serverId: super.getChannel!.guild.id }
            const value = { paused: this.paused }
    
            await MongoUpdateOne('voiceChannels', filter, value)
    
        } catch (error) {
            console.log(error)
            SendError('update BdPaused', error)
        }
    }


    //Queue
    set setQueue(queue:VideoBd[]) {
        this.queue = queue

        if(this.eventChannel === super.getChannel && this.watchEvent !== undefined){
            //Remove events if the queue is from the same channel
            
            this.watchEvent.removeAllListeners("change")
            this.watchEvent.close()
        }
        
        this.watchChannel()
        this.insertBdChannel()
    }

    get getQueue(){
        return this.queue
    }

    shuffleQueue(){
        this.queue = this.queue
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a, i) => {
            return {
                ...a.value,
                index:i,
                _id: i
            }
        })
        this.index = 0
        this.insertBdChannel()
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
        this.updateBdPaused()
    }

    get isPaused(){ 
        return this.paused
    }

    //Functions
    getCurrentEmbedMessage(){
        return this.currentEmbedMessage
    }

    getCurrentEmbed(){
        const { author, title, url, image} = this.queue[this.index]
        
        this.currentEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setAuthor(`Current playing Song ${this.index+1} from ${author}`)
        .setTitle(title)
        .setURL(url!)
        .setThumbnail(image? image.url : 'https://cdn.discordapp.com/attachments/780268482519892009/823628073782083594/83372180_p0_master1200.png')
        
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