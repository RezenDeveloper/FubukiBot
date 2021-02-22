import { Message, MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import { getIdData, getImage } from './../../utils/api/pixiv';
import { SendError } from './../../utils/utils';

export const handlePixivUrl = async (message:Message) => {
    const { content, channel } = message

    const BuildEmbed = async (illust:IIllust) => {

        const { title, user, meta_single_page, meta_pages, total_view, tags, sanity_level, total_bookmarks, create_date } = illust
        let attachPromises:Promise<MessageAttachment>[]
        if(meta_pages.length){
            attachPromises = meta_pages.map(async ({image_urls}) => await newAttach(image_urls.original))
        }
        else{
            attachPromises = await [newAttach(meta_single_page.original_image_url)]
        }
        let attachArray = Promise.all(attachPromises)
        const dateObj = new Date(create_date)
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const date = `${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`
        const PixivEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(`${title}`)
        .setDescription(`From ${user.name}`)
        .addFields(
            {
                name: `Views`,
                value: `${total_view}`,
                inline: true
            },
            {
                name: `Hearts`,
                value: `${total_bookmarks} ❤️`,
                inline: true
            },
            {
                name: `Tags`,
                value: `${tags.map((value) => value.name).join(', ')}`
            },
            {
                name: `Sanity Level`,
                value: `${sanity_level}`,
                inline: true
            },
            {
                name: `Date`,
                value: `${date}`,
                inline: true
            },
        )
        channel.send(PixivEmbed).then(async () => {
            const array = await attachArray
            array.forEach((value) => {
                channel.send(value)
            })
        })
    }

    const regex = /https:\/\/www\.pixiv\.net\/en\/artworks\/[0-9]{8}/g
    const array = regex.exec(content)

    if(array !== null && message.author.id !== "708065683971506186"){
        const id = array[0].slice(-8)
        message.suppressEmbeds(true)
        const illust = await getIdData(id)
        if(illust){
            await BuildEmbed(illust)
            //channel.send(illust.meta_single_page.original_image_url)
        }
        else{
            SendError('get pixiv illust', 'id not found')
        }
    }
}

const newAttach = async (url:string) => {
    const ext = url.slice(-4)
    const attach = new MessageAttachment(await getImage(url), `attach${ext}`)
    return attach
}