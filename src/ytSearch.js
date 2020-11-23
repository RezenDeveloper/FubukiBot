const axios = require('axios')
const moment = require('moment');

const key = process.env.YT_KEY;

function getPlaylist(id, next, prevPlaylist) {
    next = next === undefined ? "" : next
    return axios.get(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=20&pageToken=${next}&playlistId=${id}&key=${key}`, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(async ({ data }) => {
        let playlist = await data.items.map(async (value) => {
            const { title, thumbnails, resourceId } = value.snippet
            const seconds = await getTime(resourceId.videoId);

            return({
                    title: title,
                    image: thumbnails.maxres.url,
                    url: `https://www.youtube.com/watch?v=${resourceId.videoId}`,
                    seconds: seconds,
                    id: resourceId.videoId
            })
        })
        if (data.nextPageToken !== undefined && !prevPlaylist) {
            console.log('first')
            const nextPlaylist = await getPlaylist(id, data.nextPageToken, true)
            playlist = playlist.concat(nextPlaylist)
            return (Promise.all(playlist))
        }
        else if (prevPlaylist && data.nextPageToken !== undefined) {
            console.log('middle')
            const nextPlaylist = await getPlaylist(id, data.nextPageToken, true)
            playlist = playlist.concat(nextPlaylist)
            return Promise.all(playlist)
        }
        else {
            console.log('last')
            return Promise.all(playlist)
        }
    })
    .catch((error) => {
        console.error(error)
    })
}

function getTime(id) {
    return axios.get(`https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${id}&key=${key}`).then(res => {
        const duration = res.data.items[0].contentDetails.duration
        const time = moment.duration(duration, moment.ISO_8601);
        return time.asSeconds()
    })
}

module.exports = {
    getPlaylist
}