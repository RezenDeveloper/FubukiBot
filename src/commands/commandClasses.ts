import { StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js"
import { clearMusicStatus, SendError, setMusicStatus } from "../utils/utils"
import { getConfig } from './../utils/utils';

class ConfigClass {
    private config = getConfig()

    async getConfig(){
        return await this.config
    }
}

class VoiceChannelClass {
    private channel?:VoiceChannel
    private musicStatus?:string
    private connection?:VoiceConnection
    private dispatcher?:StreamDispatcher
    private dispatcherStatus:'running'|'ended' = "running"

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
            await setMusicStatus(this.musicStatus!)
            this.dispatcherStatus = 'running'
        })
        this.dispatcher!.on('error', async (err) => { 
            SendError("Dispatcher",err)
            await clearMusicStatus()
            this.dispatcherStatus = 'ended'
        })
        this.dispatcher!.on('close', async () => { 
            await clearMusicStatus()
            this.dispatcherStatus = 'ended'
        })
    }
}

class QueueClass {
    private queue:iVideo[]
    private index:number
    private time:number = 0

    constructor(){
        this.queue = []
        this.index = 0
        this.time = 0
    }
    //Queue
    set setQueue(queue:iVideo[]) {
        console.log('queue setted')
        this.queue = queue
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
    }

    //Index
    set setIndex(index:number){
        if(index < this.queue.length && this.queue.length !== 0){
            this.index = index
            this.time = 0
        }
    }
    nextIndex(){
        this.index++
        this.time = 0
    }
    prevIndex(){
        this.index--
        this.time = 0
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
export const currentVoiceChannel = new VoiceChannelClass()