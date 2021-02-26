import { Router } from 'express';
import { MongoFindOne } from '../../database/bd';
import bcrypt from 'bcryptjs'

const authRoute = Router()

authRoute.post('/authenticate', async (req, res) => {
    const { name, identifier, password } = req.query 

    if(!password) return res.status(400).send({error: 'No password provided'})
    if(!name) return res.status(400).send({error: 'No user provided'})
    if(!identifier) return res.status(400).send({error: 'No identifier provided'})
    
    const user = await MongoFindOne('users', { name, identifier }) as User

    if(user){
        if(!await bcrypt.compare(password as string, user.password)) 
            return res.status(400).send({ error: 'Invalid Password' })
    }
    else{
        return res.status(400).send({ error: 'User not found' })
    }

    const { currentChannel, identifier:bdIdentifier, name:bdName, nickName, token } = user

    return res.status(200).send({
        user:{
            name:bdName,
            nickName,
            identifier:bdIdentifier,
            currentChannel,
        },
        token
    })
})

export default authRoute