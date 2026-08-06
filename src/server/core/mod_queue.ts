import { Post, reddit, settings} from "@devvit/web/server";
import { createMessage, DiscordMessage, listMessages, startThreadFromMessage } from './discord'

export const getRedditModQueue = async (subredditName: string) => {
    console.log(`Getting Mod Queue for ${subredditName}`);

    try {
        const subreddit = await reddit.getSubredditByName(subredditName);

        const queue = await subreddit.getModQueue({
            type: 'post'
        });

        if (!queue.hasMore) {
            console.log(`Mod Queue is empty for ${subredditName}`);
            return [];
        }
        return await queue.all()
    } catch (error) {
        console.error(error)
        return [];
    }
}

export const getDiscordModQueue = async () => {
    console.log(`Getting Mod Queue from Discord`);

    try {
        const environment = await settings.get("environment");

        const discordModQueueChannel: string|undefined = await settings.get(`discordModQueueChannel${environment}`);

        if (!discordModQueueChannel) {
            console.log("Discord Mod Queue Channel not defined. Skipping...")
            return [];
        }

        return listMessages(discordModQueueChannel);
    } catch (error) {
        console.error(error)
        return [];
    }
}

export const populateDiscordModQueue = async(queueItem: Post) => {
    console.log(`Adding message ${queueItem} to Mod Queue in Discord`);

    const environment = await settings.get("environment");

    const discordModQueueChannel: string|undefined = await settings.get(`discordModQueueChannel${environment}`);

    if (!discordModQueueChannel) {
        console.log("Discord Mod Queue Channel not defined. Skipping...")
        return
    }

    try {
        const createMessageResponse = await createMessage(discordModQueueChannel, {
            embeds: [
                {
                    title: queueItem.title,
                    timestamp: queueItem.createdAt.toISOString(),
                    description: queueItem.body,
                    author: {"name": queueItem.authorName},
                    type: 'rich',
                    url: queueItem.url,
                    fields: [
                        {
                            name: "Community",
                            value: queueItem.subredditName
                        },
                        {
                            name: "Created At",
                            value: queueItem.createdAt.toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
                        },
                        {
                            name: "Post Author",
                            value: queueItem.authorName
                        }
                    ]
                }
            ]
        });

        if (!createMessageResponse) return;

        const startThreadFromMessageResponse = await startThreadFromMessage(discordModQueueChannel, createMessageResponse.get("id"));
    } catch (error) {
        console.log(`Failed to populate mod queue in ${discordModQueueChannel}`)
    }
}