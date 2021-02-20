import { Message, TextChannel } from 'discord.js';
import { SearchVideo } from '../../utils/api/ytSearch';
import { FieldsEmbed } from 'discord-paginationembed'
import { getNickname, SendError } from './../../utils/utils';
import { currentQueue, searchObj } from './../commandClasses';
import { playCurrentMusic } from './playCurrentMusic';

export const search = async (message:Message, waiting?:boolean) => {

    const { content, channel, author } = message
    const nick = await getNickname(author)
    
    if(waiting){
        const index = (parseInt(content) -1);
        const queue = currentQueue.getQueue
        const searchQueue = searchObj.getSearchQueue
        const music = searchQueue[index]

        if(parseInt(content) >= 0 && parseInt(content) < searchQueue.length ){
            currentQueue.setQueue = [
                ...queue,
                music
            ]
            playCurrentMusic()
            channel.send(`Playing the song: ${music.title}`);
            searchObj.setWaiting = false;
            searchObj.setSearchQueue = []
        }
        else{
            channel.send(`Please send me a valid number ${nick}`)
            searchObj.setWaiting = false;
        }
        return
    }

    const search = content.replace(content.split(' ')[0],'');
    
    SearchVideo(search).then(({ result }) => {
        searchObj.setSearchQueue = result

        const SearchEmbed = new FieldsEmbed()
        SearchEmbed.embed.setColor("#0099ff");
        SearchEmbed.embed.setTitle("Search Results:");
        SearchEmbed.setChannel(channel as TextChannel);
        SearchEmbed.setElementsPerPage(10);
        SearchEmbed.setAuthorizedUsers([]);
        SearchEmbed.setArray(
            result.map((_,index) => index)
        );
        SearchEmbed.formatField('Musics', (i) => {
            const time = result[i as number].seconds;
            const minutes = Math.floor(time/60) > 1? Math.floor(time/60):"00";
            const seconds = time-(Math.floor(time/60)*60);
            const hours = Math.floor(time / 3600) > 1? Math.floor(time / 3600) : "00";

            return `**Song ${(i as number+1)}** ${result[i as number].title} **${hours}:${minutes}:${seconds}**`
        });
        SearchEmbed.setDisabledNavigationEmojis(['delete','jump']);	
        SearchEmbed.setTimeout(0);
        searchObj.setWaiting = true;
        channel.send(`What's the number of the sound that you want to play ${nick}?`);
        SearchEmbed.build()
    }).catch(err => {
        SendError("SearchEmbed",err)
    })
}