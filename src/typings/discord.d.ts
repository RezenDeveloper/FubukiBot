import { CacheType, ChatInputCommandInteraction } from "discord.js"

declare global {  
  type InteractionResponse = (interaction: ChatInputCommandInteraction<CacheType>) => void

  interface SlashCommand {
    name: string
    type?: number
    description: string
    options?: Option[]
  }
  
  interface SlashCommandOption {
    name: string
    description: string
    type?: number
    required: boolean
    choices?: {
      name: string
      value: string
    }[]
  }
}
