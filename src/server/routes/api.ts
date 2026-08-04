import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';

export const api = new Hono();

