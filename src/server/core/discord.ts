import { settings } from "@devvit/web/server";
import { discordApiUrl } from '../../shared/api';

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

export type DiscordUser = {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
    bot?: boolean;
    system?: boolean;
    mfa_enabled?: boolean;
    banner?: string;
    accent_color?: string;
    locale?: string;
    verified: boolean;
    email?: string;
    flags?: number;
    premium_type: number;
    public_flags: number;
    avatar_decoration_data?: object;
    collectibles?: object;
    primary_guild?: object;
}

export type DiscordEmoji = {
    id?: string;
    name: string;
}

export type DiscordReaction = {
    count: number;
    count_details: object;
    me: boolean;
    me_burst: boolean;
    emoji: DiscordEmoji;
    burst_colors: object[]
}

export type DiscordMessage = {
    id: string;
    channel_id: string;
    author: DiscordUser;
    content: string;
    timestamp: string;
    edited_timestamp?: string;
    tts: boolean;
    mention_everyone: boolean;
    mentions: DiscordUser[];
    mention_roles: object[];
    mention_channels?: object[];
    attachments: object[];
    embeds: DiscordEmbed[];
    reactions?: DiscordReaction[];
    nonce?: number|string;
    pinned: boolean;
    webhook_id?: string;
    type: number;
    activity?: object;
    application?: object;
    application_id?: string;
    flags?: number;
    message_reference?: object;
    message_snapshots?: object;
    referenced_messsage?: DiscordMessage;
    interaction_metadata?: object;
    interaction?: object;
    thread?: object;
    components?: DiscordMessage[];
    sticker_items?: object[];
    stickers?: object[];
    position?: number;
    role_subscription_data?: object;
    resolved?: object;
    poll?: object;
    call?: object;
    shared_client_theme?: object;
}

export type DiscordCreateMessageRequest = {
    content?: string;
    nonce?: number|string;
    tts?: boolean;
    embeds?: DiscordEmbed[];
    allowed_mentions?: object;
    message_reference?: object;
    components?: object[];
    sticker_ids?: string[];
    files?:  object[];
    payload_json?: string;
    attachments?: object[];
    flags?: number;
    enforce_nonce?: boolean;
    poll?: object;
    shared_client_theme?: boolean;
}

const sendDiscordApiRequest = async(requestMethod: string, endpointUrl: string, body?: object) => {
    try {
        const botToken = await settings.get("botToken");

        const requestUrl = `${discordApiUrl}/${endpointUrl}`;

        const discordApiResponse = await fetch(requestUrl, {
            method: requestMethod,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Authorization': `Bot ${botToken}`
            }
        });

        return await discordApiResponse.json()
    } catch(error) {
        console.log(error);
        return 
    }
}

export const listMessages = async (channelId: string) => {
    console.log(`Listing Messages from Discord Channel: ${channelId}`);

    try {
        const endpointUrl = `channels/${channelId}/messages`;

        const listMessagesResponse = await sendDiscordApiRequest('GET', endpointUrl);

        return listMessagesResponse as DiscordMessage[]
    } catch (error) {
        console.error(error)
        return [];
    }
}

export const createMessage = async(channelId: string, message: DiscordCreateMessageRequest) {
    const endpointUrl = `channels/${channelId}/messages`;

    try {
        const createMessageResponse = sendDiscordApiRequest('POST', endpointUrl, message);

        console.log(`Created message in ${channelId}: ${createMessageResponse}`)

        return createMessageResponse;
    } catch(error) {
        console.error(error)
        return
    }
}

export const startThreadFromMessage = async(channelId: string, messageId: string) => {
    const endpointUrl = `channels/${channelId}/messages/${messageId}/threads`;

    const startThreadFromMessageResponse = await sendDiscordApiRequest('POST', endpointUrl);

    console.log(`Created a new thread on message ${messageId} in channel ${channelId}: ${startThreadFromMessageResponse}`);

    return startThreadFromMessageResponse;
}

export const deleteMessage = async(channelId: string, messageId: string) {
    const endpointUrl = `channels/${channelId}/messages/${messageId}`;

    try {
        const deleteMessageResponse = await sendDiscordApiRequest('DELETE', endpointUrl);
    } catch(error) {
        console.error(`Failed to delete message ${messageId} in ${channelId}: ${error}`);
    }
}