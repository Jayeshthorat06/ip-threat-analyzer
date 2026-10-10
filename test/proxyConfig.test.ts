
import { afterEach, describe, expect, it } from 'vitest';

describe('trust proxy configuration', () => {
  const originalValue = process.env.TRUST_PROXY_HOPS;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.TRUST_PROXY_HOPS;
    } else {
      process.env.TRUST_PROXY_HOPS = originalValue;
    }
  });

  it('enables trust proxy for a configured hop count', async () => {
    process.env.TRUST_PROXY_HOPS = '1';

    const { app } = await import('../src/app');

    expect(app.get('trust proxy')).toBe(1);
  });
});