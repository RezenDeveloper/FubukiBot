import 'dotenv/config'
import { RefreshSlashCommands, SetCommandPaths, CommandCollection } from './register'
import { client } from './client'

const { TOKEN } = process.env

client.on('ready', async () => {
  const userTag = client?.user?.tag
  
  // await RefreshSlashCommands()
  await SetCommandPaths()
  console.log(`Logged in as ${userTag}!`)
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