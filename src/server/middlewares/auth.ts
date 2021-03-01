import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken';

import { secret } from '../config/auth.json'

const Auth = (req:Request, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization

    if(!authHeader) return res.status(401).send({ error: 'No token provided' })

    const parts = authHeader.split(' ')
    
    if(parts.length !== 2) return res.status(401).send({ error: 'Token malformatted' })

    const [ bearer, token ] = parts

    if(!/^Bearer$/.test(bearer)) return res.status(401).send({ error: 'Token malformatted'  })


    jwt.verify(token, secret, (err, decoded:any) => {
        if(err) return res.status(401).send({ error: 'Invalid token' })

        req.userId = decoded.id
        return next()
    })

}

export default Auth