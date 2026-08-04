import { reddit, settings } from "@devvit/web/server";

export type ReportResponse = {
    reason: string;
    subreddit?: string;
    postUrl?: string;
    authorId?: string;
    numReports?: number;
    spam?: boolean;
    createdAt?: number;
    title?: string;
};

export type DiscordWebhookForm = {
    content?: string;
    username?: string;
    avatar_url?: string;
    tts?: boolean
    embeds?: DiscordEmbed[];
    allowed_mentions?: object;
    components?: object[];
    files?: object;
    payload_json?: string;
    attachments?: object[];
    flags?: number;
    thread_name?: string;
    applied_tags?: object[];
    poll?: object;

}
export type DiscordEmbedFooter = {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
};

export type DiscordEmbedField = {
    name: string;
    value: string;
    inline?: boolean;
};
export type DiscordEmbed = {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: DiscordEmbedFooter;
    image?: object;
    thumbnail?: object;
    video?: object;
    provider?: object;
    author?: object;
    fields?: DiscordEmbedField[];
    flags?: number;
};


export const sendPostReport = async (r: ReportResponse) => {
    const environment = await settings.get("environment");

    const postAuthor = await reddit.getUserById(r.authorId as `t2_${string}`);

    const postUrl = `https://reddit.com${r.postUrl}`;

    const payload = {
        username: "CAPN Mod Tools",
        avatar_url: "",
        embeds: [{
            title: `${r.title}`,
            type: 'rich',
            url: postUrl,
            description: `Please create a thread from this post to discuss and provide any additional evidence.`,
            fields: [
                {
                    name: "Post Author",
                    value: postAuthor?.username
                },
                {
                    name: "Report Reason",
                    value: r.reason
                },
                {
                    name: "Post Created",
                    value: r.createdAt ? new Date(r.createdAt).toLocaleString("en-US", {"timeZone": "America/Los_Angeles"}) : "No Date" 
                },
                {
                    name: "Community",
                    value: r.subreddit
                },
                {
                    name: "Post Link",
                    value: postUrl
                },
                {
                    name: "Spam",
                    value: r.spam ? "Yes" : "No"
                },
            ]
        }],
    } as DiscordWebhookForm;

    console.log(`Request Body: ${JSON.stringify(payload)}`)

    const response = await fetch(await settings.get(`webhook${environment}`) as string, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Error encountered when sending post report: ${await response.text()} (${response.status})`)
    }

    console.log(`Sent post report for post ${r.title} in subreddit ${r.subreddit}`)
}