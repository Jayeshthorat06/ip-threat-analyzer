
import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const originalTrustProxyHops = process.env.TRUST_PROXY_HOPS;

afterEach(() => {
  if (originalTrustProxyHops === undefined) {
    delete process.env.TRUST_PROXY_HOPS;
  } else {
    process.env.TRUST_PROXY_HOPS = originalTrustProxyHops;
  }

  vi.resetModules();
});

describe('trusted proxy configuration', () => {
  it('uses forwarded client IPs for separate rate-limit buckets', async () => {
    process.env.TRUST_PROXY_HOPS = '1';
    vi.resetModules();

    const { app } = await import('../src/app');

    // Exhaust the rate limit for the first forwarded client.
    for (let i = 0; i < 30; i++) {
      const response = await request(app)
        .post('/validate-ip')
        .set('X-Forwarded-For', '198.51.100.10')
        .send({ ip: '192.0.2.10' });

      expect(response.status).toBe(200);
    }

    // The first client's next request must be limited.
    const limited = await request(app)
      .post('/validate-ip')
      .set('X-Forwarded-For', '198.51.100.10')
      .send({ ip: '192.0.2.10' });

    expect(limited.status).toBe(429);

    // A second client should have its own rate-limit bucket.
    const secondClient = await request(app)
      .post('/validate-ip')
      .set('X-Forwarded-For', '198.51.100.20')
      .send({ ip: '192.0.2.10' });

    expect(secondClient.status).toBe(200);
  });

  it('leaves proxy trust disabled when the setting is unset', async () => {
    delete process.env.TRUST_PROXY_HOPS;
    vi.resetModules();

    const { app } = await import('../src/app');

    expect(app.get('trust proxy')).toBe(false);
  });

  it.each(['0', 'abc', '1.5', ''])(
    'rejects invalid TRUST_PROXY_HOPS value: %j',
    async (value) => {
      process.env.TRUST_PROXY_HOPS = value;
      vi.resetModules();

      await expect(import('../src/app')).rejects.toThrow(
        /TRUST_PROXY_HOPS/
      );
    }
  );

  it('accepts a valid proxy hop count', async () => {
    process.env.TRUST_PROXY_HOPS = '1';
    vi.resetModules();

    const { app } = await import('../src/app');

    expect(app.get('trust proxy')).toBe(1);
  });
});