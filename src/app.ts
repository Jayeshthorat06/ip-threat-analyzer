import express from 'express';
import { validateIp } from './services/ipValidator';
import { scoreThreat, ThreatSignals } from './services/threatScorer';
import { apiRateLimiter } from './middleware/rateLimiter';


export const app = express();

const trustProxyHops = process.env.TRUST_PROXY_HOPS;

if (trustProxyHops !== undefined) {
  const hops = Number(trustProxyHops);

  if (!Number.isInteger(hops) || hops < 1) {
    throw new Error(
      'TRUST_PROXY_HOPS must be a positive integer when configured'
    );
  }

  app.set('trust proxy', hops);
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(apiRateLimiter);

app.use(express.json({ limit: '16kb' }));

app.post('/validate-ip', (req, res) => {
  const result = validateIp(req.body?.ip);
  if (!result.valid) {
    return res.status(400).json({ error: 'ip must be a valid IPv4 or IPv6 address' });
  }
  return res.status(200).json(result);
});

app.post('/analyze', (req, res) => {
  const ipResult = validateIp(req.body?.ip);
  if (!ipResult.valid) {
    return res.status(400).json({ error: 'ip must be a valid IPv4 or IPv6 address' });
  }

  const signals = req.body?.signals;
  if (signals === undefined || signals === null || typeof signals !== 'object' || Array.isArray(signals)) {
    return res.status(400).json({ error: 'signals must be an object' });
  }
  if (signals.onBlocklist !== undefined && typeof signals.onBlocklist !== 'boolean') {
    return res.status(400).json({ error: 'onBlocklist must be a boolean' });
  }

  try {
    const assessment = scoreThreat(signals as ThreatSignals);
    return res.status(200).json({ ip: ipResult.normalized, ...assessment, source: 'caller-supplied-signals' });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid signals' });
  }
});
