
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('API rate limiting integration', () => {
  it('does not rate-limit health checks', async () => {
    for (let i = 0; i < 35; i++) {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    }
  });

  it('counts malformed JSON requests against the API limit', async () => {
    const malformed = await request(app)
      .post('/validate-ip')
      .set('Content-Type', 'application/json')
      .send('{"ip":');

    // The limiter runs before JSON parsing.
    expect(malformed.status).toBe(400);

    // The malformed request consumed one of the 30 allowed requests.
    for (let i = 0; i < 29; i++) {
      const response = await request(app)
        .post('/validate-ip')
        .send({ ip: '192.0.2.10' });

      expect(response.status).toBe(200);
    }

    const limited = await request(app)
      .post('/validate-ip')
      .send({ ip: '192.0.2.10' });

    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/too many requests/i);
  });
});