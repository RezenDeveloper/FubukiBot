import { StreamDispatcher, VoiceChannel, VoiceConnection } from "discord.js"
import { MongoUpdateOne } from "../database/bd";
import { clearStatus, SendError, setStatus } from "../utils/utils"
import { getDBConfig } from './../utils/utils';

export class VoiceChannelClass {
    private channel?:VoiceChannel
    private musicStatus?:string
    private connection?:VoiceConnection
    private dispatcher?:StreamDispatcher
    private dispatcherStatus:'running'|'ended' = "running"

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
    set setMusicStatus(status:string){
        this.musicStatus = status
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
class ConfigClass {
    private config = getDBConfig()

    get getConfig(){
        return this.config
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
export const config = new ConfigClass()