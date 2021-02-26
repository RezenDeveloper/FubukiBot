import { Router } from 'express';
import { MongoSearch } from '../../database/bd';

const getRoute = Router()

getRoute.get('/channel', async (req, res) => {
    
})

getRoute.get('/queue', async (req, res) => {
    const { channelId } = req.query

    if(!channelId) return res.send({ error: 'No channelId provided' })
    
    try {
        const queue = await MongoSearch('queue',{ channelId })
        return res.status(200).send({ queue })

    } catch (error) {
        return res.status(404).send({
            error: 'DataBase Error',
            status: 404
        })
    }
})


export default getRoute