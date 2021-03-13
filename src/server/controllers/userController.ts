import { Router } from 'express';
import { MongoFindOne } from '../../database/bd';

const getRoute = Router()

getRoute.get('/channel', async (req, res) => {
    const { userId } = req
    
    const { currentChannel }  = await MongoFindOne('users', { userId }, { currentChannel: 1 }) as { _id:string, currentChannel:string }
    
    res.status(200).send({ currentChannel })
})

getRoute.get('/channelDetails', async (req, res) => {
    const { channelId } = req.query
    if(!channelId) return res.status(404).send({ error: 'No channelId provided' })
    
    try {
        const channelDetails = await MongoFindOne('voiceChannels', { channelId })
        return res.status(200).send({ channelDetails })

    } catch (error) {
        return res.status(404).send({
            error: 'DataBase Error',
            status: 404
        })
    }
})


export default getRoute