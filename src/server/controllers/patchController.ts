import { Router } from 'express';
import { MongoSort, MongoUpdateOne } from '../../database/bd';

const updateRoute = Router()

interface PatchQueue {
    to:number
    from:number
    channelId:string
    fromId:number
    toId:number
    lenght: number
}

updateRoute.patch('/index', async (req, res) => {
    const { index, play, channelId } = req.body
    //console.log('play',play)
    //console.log('index',index)

    await MongoUpdateOne('voiceChannels', { channelId }, { index: Number(index), play })

    res.status(200).send()
})

updateRoute.patch('/queue', async (req, res) => {
    const { to, from, channelId, fromId, toId, lenght } = req.body as PatchQueue

    try {
        if(to > from){
            //console.log('decrease 1 from',from+1,'to',to)
            for(let i = (from+1); i <= to; i++){
                //console.log(`-1 from queue.${i}.index`)
                await MongoUpdateOne('voiceChannels', { channelId }, { [`queue.${i}.index`]: -1 }, true)
            }
        }
        if(from > to){
            //console.log('increase 1 from',to,'to',from-1)
            for(let i = (to); i < from; i++){
                //console.log(`+1 from queue.${i}.index`)
                await MongoUpdateOne('voiceChannels', { channelId }, { [`queue.${i}.index`]: 1 }, true)
            }
        }
        
        await MongoUpdateOne('voiceChannels', { channelId, 'queue._id': fromId }, { 'queue.$.index': to })
        await MongoSort('voiceChannels', { channelId }, 'queue', { $each: [], $sort: { index: 1 } })

        res.status(200).send()

    } catch (error) {
        console.log(error)
    }
})

updateRoute.patch('/paused', async (req, res) => {
    const { paused, channelId } = req.body

    await MongoUpdateOne('voiceChannels', { channelId }, { paused })

    res.status(200).send()
})


export default updateRoute