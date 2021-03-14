import axios from 'axios'
import { Message } from 'discord.js'

export const app = async (message:Message) => {
    const { author } = message
    
    const password = getPassword()

    try {
        await axios.post('https://fubuki-server.herokuapp.com/api/auth/register', {
            name:author.username,
            nickName: '',
            password,
            identifier: author.discriminator,
            userId: author.id
        })
        author.send(`Your password is ${password}`)
    } catch (error) {
        if(error.response.data.error){
            author.send(error.response.data.error)
        }
    }
    
} 

const getPassword = () => {
    return String(Math.floor(Math.random() * 90000) + 10000)
}