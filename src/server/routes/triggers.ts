import { Hono } from 'hono';
import type { OnAppInstallRequest, OnPostReportRequest, TriggerResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { createPost } from '../core/post';
import { sendPostReport } from '../core/reports';

export const triggers = new Hono();

triggers.post("/on-post-report", async (c) => {
  try {
    const input = await c.req.json<OnPostReportRequest>();

    await sendPostReport({
      reason: input.reason,
      subreddit: input.subreddit?.name,
      numReports: input.post?.numReports,
      spam: input.post?.spam,
      authorId: input.post?.authorId,
      createdAt: input.post?.createdAt,
      postUrl: input.post?.url,
    });

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Retrieved report in subreddit ${context.subredditName} with id ${context.postId}`
      },
      200
    );
  } catch (error) {
    console.error(`Error retrieving report: ${error}`);
    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: `Failed to retrieve report in ${context.subredditName} for ${context.postId}`
      },
      500
    )
  }
});

triggers.post('/on-app-install', async (c) => {
  try {
    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Post created in subreddit ${context.subredditName} with id ${post.id} (trigger: ${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to create post',
      },
      400
    );
  }
});
