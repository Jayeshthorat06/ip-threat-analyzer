import express from 'express';
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApiRateLimiter } from '../src/middleware/rateLimiter';

describe('API rate limiting', () => {
  it('allows requests under the configured limit and returns 429 after it', async () => {
    const testApp = express();
    testApp.use(createApiRateLimiter(2, 60_000));
    testApp.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

    expect((await request(testApp).get('/health')).status).toBe(200);
    expect((await request(testApp).get('/health')).status).toBe(200);
    const limited = await request(testApp).get('/health');
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/too many requests/i);
  });
});
