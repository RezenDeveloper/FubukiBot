import axios, { AxiosResponse } from 'axios'
import moment from 'moment'
 
const key = process.env.YT_KEY;

interface PlaylistItem {
    snippet: {
        resourceId: {
            videoId:string
        }
    }
}
interface iSearchVideo {
    data: {
        items:[
            {
                id:{
                    videoId:string
                }
            }
        ]
        nextPageToken:string
    }
}
interface iVideoInfoApi {
    data: {
        items:[
            {
                contentDetails:{
                    duration:number
                    itemCount:number
                },
                snippet:iSnippet,
                status:{
                    privacyStatus:string
                }
            }
        ]
    }
}
interface iSnippet {
    title:string
    description:string
    publishedAt:string
    channelTitle:string
    liveBroadcastContent:string
    thumbnails:{
        maxres:string
    }
}

export const getPlaylistItems = (id:string, next?:string, prevPlaylist?:boolean) => {
    next = next? next : ""
    return axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${next}&playlistId=${id}&key=${key}`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(async ({ data }) => {
        let playlist:iVideo[] = await data.items.map(async (value:PlaylistItem) => {

            const id:string = value.snippet.resourceId.videoId
            const url = `https://www.youtube.com/watch?v=${id}`
            
            let items:iVideo = {
                ...await getVideoInfo(id),
                url
            };
            return items
        })

        if (data.nextPageToken !== undefined && !prevPlaylist) {
            //console.log('first')
            const nextPlaylist = await getPlaylistItems(id, data.nextPageToken, true)
            playlist = playlist.concat(nextPlaylist)
            return Promise.all(playlist)
        }
        else if (prevPlaylist && data.nextPageToken !== undefined) {
            //console.log('middle')
            const nextPlaylist:iVideo[] = await getPlaylistItems(id, data.nextPageToken, true)
            playlist = playlist.concat(nextPlaylist)
            return Promise.all(playlist)
        }
        else {
            //console.log('last')
            return Promise.all(playlist)
        }
    })
}

export const getVideoInfo = (id:string):Promise<iVideo> => {
    return axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${id}&key=${key}`).then(({data}:iVideoInfoApi) => {
        const {contentDetails,snippet,status} = data.items[0]
        const {title, description, publishedAt, channelTitle, liveBroadcastContent, thumbnails} = snippet
        const {privacyStatus} = status
        const seconds = moment.duration(contentDetails.duration, "seconds").asSeconds()
        const image = thumbnails.maxres
        const isLive = liveBroadcastContent === "live"
        return {
            title,
            description,
            image,
            seconds,
            publishedAt,
            author:channelTitle,
            isLive,
            status:privacyStatus
        }
    })
}
export const getPlaylistInfo = (id:string) => {
    return axios.get(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,id,status&id=${id}&key=${key}`).then(({data}:iVideoInfoApi) => {
        const {snippet,status,contentDetails} = data.items[0]
        const { title, description, thumbnails, channelTitle } = snippet
        return{
            status:status.privacyStatus,
            itemCount:contentDetails.itemCount,
            title,
            description,
            image:thumbnails.maxres,
            author:channelTitle
        }
    })
}
export const getPlaylist = async (id:string) => {
    const { title, description, author, status, itemCount, image } = await getPlaylistInfo(id)
    const items = await getPlaylistItems(id)
    return {
        title,
        description,
        author,
        status,
        image,
        items,
        itemCount
    }
}
export const SearchVideo = async (query:string, limit?:number, next?:string) => {
    next = next? next : ""
    limit = limit? limit : 30
    return axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=id&maxResults=${limit}&q=${query}&pageToken=${next}&type=video&key=${key}`).then(async({data}:iSearchVideo) => {
        const { nextPageToken } = data

        let result:Promise<iVideo>[] = data.items.map(async ({ id: apiId }) => {
            const id = apiId.videoId
            const url = `https://www.youtube.com/watch?v=${id}`

            return {
                ...await getVideoInfo(id),
                url
            }
        })
        return{
            nextPageToken,
            result: await Promise.all(result)
        }
    })
}