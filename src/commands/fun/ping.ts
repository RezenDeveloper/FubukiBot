const ping: InteractionResponse = (interaction) => {
  interaction.reply('Pong!')
}

module.exports = {
  execute: ping
}