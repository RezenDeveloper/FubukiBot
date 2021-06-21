import { Message } from 'discord.js'
import { apolloClient, getToken } from '../../utils/api/fubuki/fubuki'
import { insertUser } from '../../utils/api/fubuki/users'
import { getNickname, SendError } from '../../utils/utils'

export const app = async (message:Message) => {
    const { author } = message
    
    const password = getPassword()

    try {
        await apolloClient.mutate({ 
            mutation:insertUser,
            variables: {
                userId: author.id,
                name: author.username,
                nickName: await getNickname(author),
                identifier: author.discriminator,
                password
            },
            context: {
                headers: {
                    authorization: `Bearer ${await getToken()}`
                }
            }
        })
        author.send(`Your password is ${password}`)
    } catch (error) {
        const errorMsg = error.graphQLErrors[0].message
        if(errorMsg === 'User already registered'){
            author.send(errorMsg)
        }
        else{
            SendError('App registration error', error)
        }
    }
    
} 

const getPassword = () => {
    return String(Math.floor(Math.random() * 90000) + 10000)
}