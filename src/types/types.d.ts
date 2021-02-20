interface Iconfig {
    _id: ObjectId
    prefix: string
    textCommands: Icommand[]
    voiceCommands: IcommandVoice[]
    botId: string
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