import axios, { AxiosError, AxiosResponse } from 'axios'
import { SendError } from './../utils';

export const getAnime =  (name:string, limit?:number) => {
    const limitParam = limit? `&limit=${limit}`: ''
    return axios.get(`https://api.jikan.moe/v3/search/anime?q=${name}${limitParam}`).then(({ data }:AxiosResponse<MALSearchData>) => {
        const { results } = data 
        const { mal_id } = results[0]
        return getAnimeDetails(mal_id)
    })
    .catch(({ response, message }:AxiosError<MALError>) => {
        if(response){
            const { data } = response
            SendError('MAL API', data.message)
            return data
        }
        else{
            SendError('MAL API. No response error', message)
            return {
                status: 404,
                type: 'unknown',
                message,
                error: 'unknown'
            }
        }
    })        
}

const getAnimeDetails = (id:number) => {
    return axios.get(`https://api.jikan.moe/v3/anime/${id.toString()}`).then(({ data }:AxiosResponse<MALAnime>) => {
        return data
    })
    .catch(({ response, message }:AxiosError<MALError>) => {
        if(response){
            const { data } = response
            SendError('MAL API', data.message)
            return data
        }
        else{
            SendError('MAL API. No response error', message)
            return {
                status: 404,
                type: 'unknown',
                message,
                error: 'unknown'
            }
        }
    })        
}