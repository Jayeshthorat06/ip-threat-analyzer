import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { scoreThreat } from '../src/services/threatScorer';

describe('scoreThreat', () => {
  it('returns low risk when no risk signals are present', () => {
    expect(scoreThreat({})).toMatchObject({ score: 0, level: 'low' });
  });

  it('caps the score at 100 and reports critical risk', () => {
    expect(scoreThreat({ onBlocklist: true, failedLogins: 10, requestsPerMinute: 600 }))
      .toMatchObject({ score: 100, level: 'critical' });
  });

  it('rejects negative or fractional counters', () => {
    expect(() => scoreThreat({ failedLogins: -1 })).toThrow();
    expect(() => scoreThreat({ requestsPerMinute: 1.5 })).toThrow();
  });
});

describe('POST /analyze', () => {
  it('returns a deterministic assessment for valid input', async () => {
    const response = await request(app).post('/analyze').send({
      ip: '192.0.2.10',
      signals: { onBlocklist: true, failedLogins: 4, requestsPerMinute: 150 }
    });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ip: '192.0.2.10', score: 80, level: 'critical', source: 'caller-supplied-signals' });
  });

  it('rejects invalid counters and invalid IPs', async () => {
    const badCounter = await request(app).post('/analyze').send({ ip: '192.0.2.10', signals: { failedLogins: -3 } });
    const badIp = await request(app).post('/analyze').send({ ip: 'not-an-ip', signals: {} });
    expect(badCounter.status).toBe(400);
    expect(badIp.status).toBe(400);
  });
});
