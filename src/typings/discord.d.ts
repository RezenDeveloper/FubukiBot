import { CacheType, ChatInputCommandInteraction } from "discord.js"

declare global {  
  type InteractionResponse = (interaction: ChatInputCommandInteraction<CacheType>) => void

  interface SlashCommand {
    name: string
    type?: number
    description: string
    options?: SlashCommandOption[]
    nsfw?: boolean
  }
  
  type SlashCommandOption = SlashCommandOptionDefault | SlashCommandOptionString | SlashCommandOptionNumber

  const enum DefaultSlashTypes {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5, 
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11,
  }

  interface SlashCommandOptionDefault {
    name: string
    description: string
    type: DefaultSlashTypes
    required?: boolean
    options?: SlashCommandOption[]
  }

  interface SlashCommandOptionString {
    name: string
    description: string
    type: DefaultSlashTypes.STRING
    required?: boolean
    min_length: number
    max_length: number
    options?: SlashCommandOption[]
    choices?: {
      name: string
      value: string
    }[]
    autocomplete?: boolean
  }

  interface SlashCommandOptionNumber {
    name: string
    description: string
    type: DefaultSlashTypes.INTEGER | DefaultSlashTypes.NUMBER
    required?: boolean
    min_value: number
    max_value: number
    options?: SlashCommandOption[]
    choices?: {
      name: string
      value: string
    }[]
    autocomplete?: boolean
  }
}
