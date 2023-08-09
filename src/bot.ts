import 'dotenv/config'
import { RefreshSlashCommands, SetCommandPaths, CommandCollection } from './register'
import { client } from './client'

const { TOKEN } = process.env

client.on('ready', async () => {
  const userTag = client?.user?.tag
  console.log(`Logged in as ${userTag}!`)

  await RefreshSlashCommands()
  await SetCommandPaths()
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  const { commandName } = interaction

  const command = CommandCollection.get(commandName)
  
  if(!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }
  
  return command.execute(interaction)
})

client.login(TOKEN)