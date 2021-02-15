interface Iconfig {
    _id: ObjectId
    prefix: string
    textCommands: Icommand[]
    voiceCommands: Icommand[]
    botId: string
}
interface Icommand {
    name: string,
    description: string
    commands: string[]
}