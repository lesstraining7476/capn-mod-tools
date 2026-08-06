import { Hono } from 'hono';
import type { Post, TaskResponse } from '@devvit/web/server';
import { settings } from '@devvit/web/server';
import { } from '../../shared/api';
import { getDiscordModQueue, getRedditModQueue, populateDiscordModQueue } from '../core/mod_queue'
import { DiscordMessage, deleteMessage} from '../core/discord';

export const scheduler = new Hono();

scheduler.post("/internal/scheduler/handle-mod-queue", async(c) => {
    console.log(`Handling mod queue`)

    try {
        //const input = await c.req.json<TaskRequest>();

        const environment = await settings.get("environment");

        const subreddits: string|undefined = await settings.get(`subreddits${environment}`)

        if (!subreddits) {
            console.log("No subreddits configured. Skipping task...")
            return;
        }

        const redditModQueue: Post[] = [];

        for (const subredditName in subreddits.split(',')) {
            redditModQueue.push(...await getRedditModQueue(subredditName));
        }
    
        const discordModQueue: DiscordMessage[] = await getDiscordModQueue();

        const discordModQueueMap = new Map<string, DiscordMessage>();

        if (discordModQueue.length > 0) {
            discordModQueue.forEach((queueItem) => { 
                if (!queueItem.embeds[0]?.url)
                    return

                discordModQueueMap.set(
                    queueItem.embeds[0]?.url,
                    queueItem
                )
            })
        }

        redditModQueue.forEach(async (queueItem) => {
            const discordQueueItem = discordModQueueMap.get(queueItem.url)

            // Create new Discord Message for new Mod Queue Item in Reddit
            if (!discordQueueItem) {
                await populateDiscordModQueue(queueItem);
            }

            // Remove the reference to the Discord Mod Queue Item
            // if the same one exists in the Reddit Mod Queue
            discordModQueueMap.delete(queueItem.url);

            if (discordQueueItem?.reactions) {
                const reaction = discordQueueItem.reactions[0];

                if (reaction?.emoji.name == ":white_check_mark:") {
                    console.log(`Sending approval request to Reddit Mod Queue.`)
                }
            }
        });

        return c.json<TaskResponse>(
            {
                status: "ok"
            },
            200
        )
    } catch(error) {
        console.error(error);
        return c.json<TaskResponse>({
            status: 'error',
            message: `${error}`
        })
    }
});