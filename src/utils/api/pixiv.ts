import PixivApi from 'pixiv-api-client'
import { SendError } from './../utils';
import pixichan from 'pixichan'
import fs from 'fs'

const pixiv = new PixivApi()
const { PIXIV_REFRESH_TOKEN } = process.env

export const getIdData = async (id:string) => {
    try {
        
        await pixiv.refreshAccessToken(PIXIV_REFRESH_TOKEN) as IRefreshResponse
        const data = await pixiv.requestUrl(`/v1/illust/detail?illust_id=${id}`)
        return data.illust as IIllust

    } catch (err) {
        SendError('Pixiv getIdData',err)
    }
}

export const getImage = async (url:string) => {
    const data:string = await pixichan(url)
    const image = Buffer.from(data,'base64')
    return image
}