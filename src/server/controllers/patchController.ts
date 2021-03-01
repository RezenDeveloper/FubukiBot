import { Router } from 'express';
import { MongoUpdateOne } from '../../database/bd';

const updateRoute = Router()

updateRoute.patch('/index', async (req, res) => {
    const { index, channelId } = req.body

    await MongoUpdateOne('voiceChannels', { channelId }, { index: Number(index) })

    res.status(200).send()
})

updateRoute.patch('/paused', async (req, res) => {
    const { paused, channelId } = req.body

    await MongoUpdateOne('voiceChannels', { channelId }, { paused })

    res.status(200).send()
})


export default updateRoute