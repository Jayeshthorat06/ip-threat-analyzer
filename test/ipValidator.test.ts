import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { validateIp } from '../src/services/ipValidator';

describe('validateIp', () => {
  it('accepts IPv4 and IPv6 literals', () => {
    expect(validateIp('192.0.2.10')).toMatchObject({ valid: true, version: 4 });
    expect(validateIp('2001:db8::1')).toMatchObject({ valid: true, version: 6 });
  });

  it('trims surrounding whitespace', () => {
    expect(validateIp(' 192.0.2.10 ')).toMatchObject({ valid: true, normalized: '192.0.2.10' });
  });

  it.each([null, 123, '', '999.1.1.1', 'example.com', '192.0.2.1/24'])('rejects invalid input: %s', (value) => {
    expect(validateIp(value).valid).toBe(false);
  });
});

describe('POST /validate-ip', () => {
  it('returns 400 for malformed IP input', async () => {
    const response = await request(app).post('/validate-ip').send({ ip: '999.1.1.1' });
    expect(response.status).toBe(400);
  });

  it('returns the parsed IP version for valid input', async () => {
    const response = await request(app).post('/validate-ip').send({ ip: '192.0.2.10' });
    expect(response.status).toBe(200);
    expect(response.body.version).toBe(4);
  });
});
