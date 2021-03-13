import { Router } from "express"
import { MongoFindOne, MongoWatch } from "../../database/bd"

const watchRoute = Router()

const Headers = {
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'X-Accel-Buffering': 'no',
    "Access-Control-Allow-Origin": "*"
}


watchRoute.get('/user', async (req, res) => {
    const { userId } = req

    res.writeHead(200, Headers)
    
    const { watch, client } = await MongoWatch('users', { 'fullDocument.userId': userId })

    watch.on('change', (data:any) => {
        const { updatedFields } = data.updateDescription

        res.write('event: message\n')
        res.write(`data: ${JSON.stringify({
            updatedFields
        })}\n\n`)
    })

    req.on('close', () => {
        watch.removeAllListeners("change")
        watch.close()
        client.close()
    })
    req.on('error', (error) => {
        console.log(error)
        watch.removeAllListeners("change")
        watch.close()
        client.close()
    })
    req.on('end', () => {
        watch.removeAllListeners("change")
        watch.close()
        client.close()
    })
})

watchRoute.get('/channel', async (req, res) => {
    
    const { userId } = req
    
    const { currentChannel } = await MongoFindOne('users', { userId }, { currentChannel: 1 })

    if(!currentChannel)return res.status(400).send({ error: 'No channel provided' })

    res.writeHead(200, Headers)
    
    const { watch, client } = await MongoWatch('voiceChannels', { 'fullDocument.channelId': currentChannel })

    watch.on('change', (data:any) => {
        const { updatedFields } = data.updateDescription

        res.write('event: message\n')
        res.write(`data: ${JSON.stringify({
            updatedFields
        })}\n\n`)
    })

    req.on('close', () => {
        watch.removeAllListeners("change")
        watch.close()
        client.close()
    })
    req.on('error', (error) => {
        console.log(error)
        watch.removeAllListeners("change")
        watch.close()
        client.close()
    })
    req.on('end', () => {
        watch.removeAllListeners("change")
        watch.close()
        client.close()
    })
})


export default watchRoute