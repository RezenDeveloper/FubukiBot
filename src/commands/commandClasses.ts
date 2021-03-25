import { StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js"
import { MongoUpdateOne } from "../database/bd";
import { SendError } from "../utils/utils"

export class VoiceChannelClass {
    private channel?:VoiceChannel
    private connection?:VoiceConnection
    private dispatcher?:StreamDispatcher
    private dispatcherStatus:'running'|'ended'
    private leaveTimeout?:NodeJS.Timeout

    constructor () {
        this.channel = undefined
        this.connection = undefined
        this.dispatcher = undefined
        this.dispatcherStatus = 'running'
        this.leaveTimeout = undefined
    }
    //Connection
    set setConnection(connection:VoiceConnection) { 
        //if(this.connection) this.endConnection()
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
        MongoUpdateOne('voiceChannels', { serverId:channel.guild.id }, { channelId:channel.id })
        this.channel = channel
    }
    get getChannel(){
        return this.channel
    }

    //Timer
    get getLeaveTimeout(){
        return this.leaveTimeout
    }
    leaveIn(seconds:number){
        this.leaveTimeout = setTimeout(() => {
            this.endConnection()
        },seconds*1000)
    }
    clearLeaveTimeout(){
        if(this.leaveTimeout)
        clearTimeout(this.leaveTimeout)
        this.leaveTimeout = undefined
    }

    //Listeners
    private listenConnection(){
        this.connection!.on("disconnect", () => {
            this.dispatcherStatus = 'ended'
            this.channel = undefined
            this.connection = undefined
        })
    }
    private listenDispatcher(){
        this.dispatcher!.on("start", async () => {
            this.dispatcherStatus = 'running'
        })
        this.dispatcher!.on('error', async (err) => { 
            SendError("Dispatcher",err)
            this.dispatcherStatus = 'ended'
        })
        this.dispatcher!.on('close', async () => {
            this.dispatcherStatus = 'ended'
        })
    }
}
class SearchClass {
    private queue:VideoBd[] = []
    private waiting:boolean = false

    set setWaiting(waiting:boolean){
        this.waiting = waiting
    }
    get getWaiting(){
        return this.waiting
    }
    set setSearchQueue(queue:VideoBd[]){
        this.queue = queue
    }
    get getSearchQueue(){
        return this.queue
    }
}

export const searchObj = new SearchClass()