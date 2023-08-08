import { REST, Routes } from 'discord.js';
const { TOKEN, CLIENT_ID } = process.env

const commands: SlashCommand[] = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
]

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