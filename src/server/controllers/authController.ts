import { Router } from 'express';
import { MongoFindOne, MongoInsertOne, MongoUpdateOne } from '../../database/bd';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { secret } from '../config/auth'

const authRoute = Router()

interface TokenParams {
    id:string
}

const generateToken = async ( params:TokenParams ) => {
    const token = jwt.sign( params, secret, {
        expiresIn: 604800
    }) 
    
    await MongoUpdateOne('users', { userId:params.id }, { token })

    return token
}

authRoute.post('/register', async (req, res) => {
    const { name, identifier, password, userId, nickName } = req.body

    if(Object.values(req.body).length < 5)
        return res.status(400).send({
            error: 'Please provide all params',
            params: 'name, identifier, password, userId, nickName'
        })

    try {

        if(await MongoFindOne('users', { userId }))
            return res.status(400).send({ error: 'User already registered' })

        let user = {
            name,
            nickName,
            currentChannel: '',
            password: await bcrypt.hash(password,10),
            identifier,
            userId,
            token: await generateToken({ id:userId })
        }

        await MongoInsertOne('users', user)
        
        return res.status(200).send({
            name,
            nickName,
            identifier,
            token: user.token
        })
        
    } catch (error) {
        return res.status(400).send({ error: 'Database Error' })
    }

})


authRoute.post('/authenticate', async (req, res) => {
    const { name, identifier, password } = req.body 

    if(Object.values(req.body).length < 3)
        return res.status(400).send({
            error: 'Please provide all params',
            params: 'name, identifier, password'
        })

    try {
        const user = await MongoFindOne('users', { name, identifier }) as User

        if(user){
            if(!await bcrypt.compare(password as string, user.password)) 
                return res.status(400).send({ error: 'Invalid Password' })
        }
        else{
            return res.status(400).send({ error: 'User not found' })
        }

        const { currentChannel, identifier:bdIdentifier, name:bdName, nickName, userId } = user

        return res.status(200).send({
            user:{
                name:bdName,
                nickName,
                identifier:bdIdentifier,
                currentChannel,
            },
            token: await generateToken({ id:userId })
        })
    } catch (error) {
        return res.status(400).send({ error:'Database Error' })
    }
})

export default authRoute