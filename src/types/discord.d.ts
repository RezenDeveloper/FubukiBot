
interface Interaction {
  version: number
  type: number
  token: string
  id: string
  application_id: string
  user?: InteractionUser
  guild_id?: string
  member?: {
    user: InteractionUser
  }
  data?: InteractionData
  channel_id?: string
}

interface InteractionData {
  options: InteractionOption[],
  name: string
  id: string
}

interface InteractionOption {
  name: string
  value: string 
  type: number 
}

interface InteractionUser {
  username: string,
  id: string,
  discriminator: string,
  avatar: string
}

interface InteractionCallback {
  type: number
  data: {
    content?: string
    embeds?: object[]
    flags?: 64
    allowed_mentions?: object
    components?: object[]
  }
}
