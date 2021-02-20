import { Message, TextChannel } from "discord.js";
import { currentQueue } from '../commandClasses';
import { FieldsEmbed } from 'discord-paginationembed'
import { playCurrentMusic } from './playCurrentMusic';
import { getCheckEmote, getErrorEmote } from "../../utils/utils";

export const queue = (message:Message) => {

    const { channel, content } = message
    const currentQueueArray = currentQueue.getQueue

    if(currentQueueArray.length === 0){
        channel.send("There's no queue to show")
        message.react(getErrorEmote())
        return;
    }
    const number = parseFloat(content.split(' ')[1]);

    if(!number){
        //console.log(queue_global)
        const QueueEmbed = new FieldsEmbed()
        QueueEmbed.embed.setColor("#0099ff")
        QueueEmbed.embed.setTitle("Current Queue")
        QueueEmbed.setChannel(channel as TextChannel)
        QueueEmbed.setElementsPerPage(10)
        QueueEmbed.setAuthorizedUsers([])
        QueueEmbed.setArray(
            currentQueueArray.map((_,index) => {
                return (index+1)
            })
        );
        QueueEmbed.formatField('Musics', i => {
            return `**Song ${i}** -- ${currentQueueArray[(i as number -1)].title}`
        })
        QueueEmbed.setDisabledNavigationEmojis(['delete','jump'])
        QueueEmbed.setTimeout(0)
        QueueEmbed.build()
    }
    else{
        if(number <= currentQueueArray.length && number > 0){
            currentQueue.setIndex = (number-1)
            playCurrentMusic()
            message.react(getCheckEmote(message))
        }
        else{
            channel.send("This is not a valid number");
            message.react(getErrorEmote())
        }
    }
}