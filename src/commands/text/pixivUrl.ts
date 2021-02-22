import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { getIdData, getImage } from './../../utils/api/pixiv';
import { SendError, getDateString, bytesToMb } from './../../utils/utils';

export const handlePixivUrl = async (message:Message) => {
    const { content, channel } = message

    const regex = /https:\/\/www\.pixiv\.net\/en\/artworks\/[0-9]{8}/g
    const array = regex.exec(content)

    if(array !== null && message.author.id !== "708065683971506186"){
        const id = array[0].slice(-8)
        message.suppressEmbeds(true)
        const illust = await getIdData(id)

        if(illust){
            const { title, user, meta_single_page, meta_pages, total_view, tags, sanity_level, total_bookmarks, create_date, image_urls } = illust
            let attachPromises:Promise<MessageAttachment|undefined>[]
            if(meta_pages.length){
                attachPromises = meta_pages.map(async ({image_urls: image_urls_pages}) => {
                    const attach = await newAttach([
                        image_urls_pages.original,
                        image_urls_pages.large
                    ])
                    return attach
                })
            }
            else{
                attachPromises = await [newAttach([
                    meta_single_page.original_image_url,
                    image_urls.large
                ])]
            }
            let attachArray = Promise.all(attachPromises)

            const date = getDateString(new Date(create_date))
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
                array.forEach((value, index) => {
                    if(!value) channel.send(`I couldn't send the image ${index+1} because it has more than 8MB!`)
                    else channel.send(value)
                })
            })
        }
        else{
            SendError('get pixiv illust', 'id not found')
        }
    }
}

const newAttach = async (urls:string[]) => {
    for(const url of urls){
        const ext = url.slice(-4)
        const buffer = await getImage(url)

        if(bytesToMb(buffer.byteLength) < 8){
            return new MessageAttachment(buffer, `attach${ext}`)
        }
    }
}