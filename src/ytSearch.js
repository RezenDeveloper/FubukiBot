const axios = require('axios');
const moment = require('moment');

const key = process.env.YT_KEY;

function getPlaylistItems(id, next, prevPlaylist) {
    next = next === undefined ? "" : next
    return axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&pageToken=${next}&playlistId=${id}&key=${key}`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(async ({ data }) => {
        let playlist = await data.items.map(async (value) => {
            const id = value.snippet.resourceId.videoId
            let items = await getVideoInfo(id);
            const url = `https://www.youtube.com/watch?v=${id}`
            items.url = url

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
            const nextPlaylist = await getPlaylistItems(id, data.nextPageToken, true)
            playlist = playlist.concat(nextPlaylist)
            return Promise.all(playlist)
        }
        else {
            //console.log('last')
            return Promise.all(playlist)
        }
    })
    .catch((error) => {
        console.error(error)
    })
}

function getVideoInfo(id) {
    return axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${id}&key=${key}`).then(({data}) => {
        const {contentDetails,snippet,status} = data.items[0]
        const {title, description, publishedAt, channelTitle, liveBroadcastContent, thumbnails} = snippet
        const {privacyStatus} = status
        const seconds = moment.duration(contentDetails.duration, moment.ISO_8601).asSeconds()
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
function getPlaylistInfo(id){
    return axios.get(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,id,status&id=${id}&key=${key}`).then(({data}) => {
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
async function getPlaylist(id){
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
async function SearchVideo(query,limit,next){
    next = next === undefined ? "" : next
    limit = limit === undefined ? 50 : limit
    return axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=id&maxResults=${limit}&q=${query}&pageToken=${next}&type=video&key=${key}`).then(async({data}) => {
        const { nextPageToken } = data

        let result = await data.items.map(async (value) => {
            const id = value.id.videoId
            const url = `https://www.youtube.com/watch?v=${id}`

            let response = await getVideoInfo(id)
            response.url = url
            return response
        })
        result = Promise.all(result)
        return{
            nextPageToken,
            result: await result
        }
    })
}

module.exports = {
    getPlaylist,
    getVideoInfo,
    SearchVideo
}