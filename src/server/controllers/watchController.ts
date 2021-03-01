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
    
    const event = await MongoWatch('users', { 'fullDocument.userId': userId })
    
    console.log('defined')

    event.on('change', (ev:any) => {
        const user = ev.fullDocument as User

        res.write('event: message\n')
        res.write(`data: ${JSON.stringify({
            currentChannel: user.currentChannel,
            nickName: user.nickName
        })}\n\n`)
    })

    req.on('close', () => {
        event.removeAllListeners("change")
    })
    req.on('end', () => {
        event.removeAllListeners("change")
    })
})

watchRoute.get('/channel', async (req, res) => {
    
    const { userId } = req
    
    const { currentChannel } = await MongoFindOne('users', { userId }, { currentChannel: 1 })

    if(!currentChannel)return res.status(400).send({ error: 'No channel provided' })

    res.writeHead(200, Headers)
    
    const event = await MongoWatch('voiceChannels', { 'fullDocument.channelId': currentChannel })
    
    console.log('defined voice')

    event.on('change', (ev:any) => {
        const channel = ev.fullDocument as ChannelDetails

        res.write('event: message\n')
        res.write(`data: ${JSON.stringify({
            channel
        })}\n\n`)
    })

    req.on('close', () => {
        event.removeAllListeners("change")
    })
    req.on('end', () => {
        event.removeAllListeners("change")
    })
})


export default watchRoute