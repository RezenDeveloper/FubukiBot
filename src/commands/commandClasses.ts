import { StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js"
import { MongoFindOne, MongoInsertOne, MongoUpdateOne } from "../database/bd";
import { clearStatus, SendError, setStatus } from "../utils/utils"
import { getDBConfig } from './../utils/utils';

class ConfigClass {
    private config = getDBConfig()

    get getConfig(){
        return this.config
    }
}

class VoiceChannelClass {
    private channel?:VoiceChannel
    private musicStatus?:string
    private connection?:VoiceConnection
    private dispatcher?:StreamDispatcher
    private dispatcherStatus:'running'|'ended' = "running"

    //Connection
    set setConnection(connection:VoiceConnection) { 
        if(this.connection) this.endConnection()
        this.connection = connection
        this.listenConnection()
    }
    get getConnection(){
        return this.connection!
    }
    endConnection(){
        if(this.dispatcher) this.endDispatcher()
        this.connection!.disconnect()
        this.channel = undefined
        this.connection = undefined
    }

    //Dispatcher
    set setDispatcher(dispatcher:StreamDispatcher){
        if(this.dispatcher) this.endDispatcher()
        this.dispatcher = dispatcher
        this.listenDispatcher()
    }
    get getDispatcher(){
        return this.dispatcher
    }
    get getDispatcherStatus(){
        return this.dispatcherStatus
    }
    endDispatcher(){
        this.dispatcher!.destroy()
        this.dispatcherStatus = 'ended'
    }

    //Channel
    set setChannel(channel:VoiceChannel) {
        this.channel = channel
    }
    get getChannel(){
        return this.channel
    }
    set setMusicStatus(status:string){
        this.musicStatus = status
    }
    listenConnection(){
        this.connection!.on("disconnect", () => {
            this.dispatcherStatus = 'ended'
            this.channel = undefined
            this.connection = undefined
        })
    }
    listenDispatcher(){
        this.dispatcher!.on("start", async () => {
            await setStatus(this.musicStatus!, 'LISTENING')
            this.dispatcherStatus = 'running'
        })
        this.dispatcher!.on('error', async (err) => { 
            SendError("Dispatcher",err)
            await clearStatus()
            this.dispatcherStatus = 'ended'
        })
        this.dispatcher!.on('close', async () => { 
            await clearStatus()
            this.dispatcherStatus = 'ended'
        })
    }
}

export const currentVoiceChannel = new VoiceChannelClass()
class QueueClass{
    private queue:iVideo[]
    private index:number
    private time:number
    private channel?:VoiceChannel
    private paused:boolean

    constructor(){
        this.queue = []
        this.index = 0
        this.time = 0
        this.channel = currentVoiceChannel.getChannel
        this.paused = currentVoiceChannel.getDispatcher?.paused !== undefined? currentVoiceChannel.getDispatcher?.paused : false
    }

    //DataBase

    insertBdChannel = async () => {
        if(!this.channel) this.setChannel = currentVoiceChannel.getChannel!

        const exists = await MongoFindOne('voiceChannels', { channelId: this.channel!.id }, { channelId: 1 }) as { _id:string, channelId:string }
        
        if(exists){
            this.updateBdChannel()
            return
        }

        const Channel:ChannelDetails = {
            serverId: this.channel!.guild.id,
            serverName: this.channel!.guild.name,
            serverIcon: this.channel!.guild.iconURL(),
            channelId: this.channel!.id,
            name: this.channel!.name,
            queue: this.queue,
            paused: this.paused,
            index: this.index
        }

        try {

            await MongoInsertOne('voiceChannels', Channel)

        } catch (error) {
            console.log(error)
            SendError('insert BdQueue', error)
        }
    }

    updateBdChannel = async () => {
        if(!this.channel) this.setChannel = currentVoiceChannel.getChannel!

        try {
            const filter = { channelId: this.channel!.id }
            const value = { 
                queue: this.queue,
                index: this.index,
                serverName: this.channel!.guild.name,
                serverIcon: this.channel!.guild.iconURL()
            }
    
            await MongoUpdateOne('voiceChannels', filter, value)

        } catch (error) {
            console.log(error)
            SendError('update BdQueue', error)
        }
    }

    updateBdIndex = async () => {

        if(!this.channel) this.setChannel = currentVoiceChannel.getChannel!

        try {
            const filter = { channelId: this.channel!.id }
            const value = { index: this.index }
    
            await MongoUpdateOne('voiceChannels', filter, value)
    
        } catch (error) {
            console.log(error)
            SendError('update BdIndex', error)
        }
    }

    updateBdPaused = async () => {

        if(!this.channel) this.setChannel = currentVoiceChannel.getChannel!

        try {
            const filter = { channelId: this.channel!.id }
            const value = { paused: this.paused }
    
            await MongoUpdateOne('voiceChannels', filter, value)
    
        } catch (error) {
            console.log(error)
            SendError('update BdPaused', error)
        }
    }


    //Queue
    set setQueue(queue:iVideo[]) {
        this.queue = queue
        this.insertBdChannel()
    }
    get getQueue(){
        return this.queue
    }

    shuffleQueue(){
        this.queue = this.queue
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => {
            return a.value
        })
        this.index = 0
        this.insertBdChannel()
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

    //ChannelId
    set setChannel(channel:VoiceChannel){
        this.channel = channel
    }

    //paused
    set setPaused(paused:boolean){
        this.paused = paused
        this.updateBdPaused()
    }
}

class SearchClass {
    private queue:iVideo[] = []
    private waiting:boolean = false

    set setWaiting(waiting:boolean){
        this.waiting = waiting
    }
    get getWaiting(){
        return this.waiting
    }
    set setSearchQueue(queue:iVideo[]){
        this.queue = queue
    }
    get getSearchQueue(){
        return this.queue
    }
}

export const searchObj = new SearchClass()
export const config = new ConfigClass()
export const currentQueue = new QueueClass()