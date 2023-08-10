import { Collection, REST, Routes } from 'discord.js'
import * as path from 'path'
import * as fs from 'fs'

const { TOKEN, CLIENT_ID } = process.env

const commands: SlashCommand[] = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'add',
    description: 'Adds a song to the queue',
    options: [
      {
        name: 'url',
        description: 'youtube link of the song',
        type: DefaultSlashTypes.STRING,
        required: true
      }
    ]
  }
]

export const CommandCollection = new Collection<string, { execute: InteractionResponse }>()

export const RefreshSlashCommands = async () => {
  const rest = new REST({ version: '10' }).setToken(TOKEN!)
  
  try {
    console.log('Started refreshing application (/) commands.')
  
    await rest.put(Routes.applicationCommands(CLIENT_ID!), { body: commands })
  
    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

export const SetCommandPaths = async () => {
  const foldersPath = path.join(__dirname, 'commands')
  const commandFolders = fs.readdirSync(foldersPath)
  
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file)
      const commandFile = require(filePath)
      const commandName = file.slice(0, -3)

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ('execute' in commandFile) {
        CommandCollection.set(commandName, commandFile)
      }
    }
  }
}