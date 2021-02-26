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
    commands: string[],
    needParam: boolean
}
interface IcommandVoice extends Icommand {
    needVoice: boolean
}
interface iVideo{
    title:string
    url?:string
    description:string
    image:string
    seconds:number
    publishedAt:string
    author:string
    isLive:boolean
    status:string
}
interface Ichannels{
    name:string
    id:string
}

interface User {
    name:string
    nickName:string
    password:string
    identifier:string
    userId:string
    currentChannel:string
    token:string
}