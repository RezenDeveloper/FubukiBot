import 'dotenv/config'
import { RefreshSlashCommands } from './commands/register'
import { client } from './client'

const { TOKEN } = process.env

client.on('ready', async () => {
  const userTag = client?.user?.tag
  console.log(`Logged in as ${userTag}!`)

  await RefreshSlashCommands()
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  const { commandName } = interaction
  
  const path = `./commands/${commandName}`
  const fn = await import(path) as Record<string, InteractionResponse>
  
  return fn[`${commandName}`](interaction)
})

client.login(TOKEN)