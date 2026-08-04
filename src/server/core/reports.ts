export type SendPostRequest = {
    reason: string;
    subreddit?: string;
    postUrl?: string;
    authorId?: string;
    numReports?: number;
    spam?: boolean;
    createdAt?: number;
    title?: string;
};

export const sendPostReport = async (r: SendPostRequest) => {
    console.log(`${r}`);

    const payload = JSON.stringify(r);

    console.log(`${payload}`)

    const response = await fetch("https://discord.com/api/webhooks/1534058549112606746/fvmXhx877-_61ygtzuqOjxPG09arI7-38J2jwdrIAKXSNyEEE41v7lx9Qi6KcL03Sqjn", {
        method: "POST",
        body: payload,
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