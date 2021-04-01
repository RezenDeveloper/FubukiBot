interface Iconfig {
    prefix: string
    textCommands: Icommand[]
    voiceCommands: IcommandVoice[]
    adminCommands:Icommand[]
    botId: string
    admins:string[]
}
interface Icommand {
    name: string
    description: string
    commands: string[]
    needParam: boolean
    isHidden?: boolean
}
interface IcommandVoice extends Icommand {
    needVoice: boolean
}
interface VideoApi{
    title:string
    url?:string
    description:string
    image?: {
        url:string
        height:number
        width:number
    }
    seconds:number
    publishedAt:string
    author:string
    isLive:boolean
    status:string
}
interface VideoBd extends VideoApi{
    index?:number
    _id?:number
} 
interface Ichannels{
    name:string
    id:string
}

interface User {
    name:string
    nickName:string
    currentChannel:string
    password:string
    identifier:string
    userId:string
    token:string
}

interface ChannelDetails {
    serverName: string
    serverId: string
    serverIcon: string | null
    channelId: string
    channelName: string
    queue: VideoApi[]
    paused: boolean
    play: boolean
    shuffle: boolean
    index: number
    volume: number
}