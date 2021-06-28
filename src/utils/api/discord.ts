import axios from "axios"

const base_url = 'https://discord.com/api'

export const sendInteractionCallback = async (data:InteractionCallback, interactionId:string, interactionToken:string) => {
  await axios.post(`${base_url}/interactions/${interactionId}/${interactionToken}/callback`, data)
}