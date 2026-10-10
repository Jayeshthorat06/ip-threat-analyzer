import express from 'express';
import { validateIp } from './services/ipValidator';

export const app = express();
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/validate-ip', (req, res) => {
  const result = validateIp(req.body?.ip);
  if (!result.valid) {
    return res.status(400).json({ error: 'ip must be a valid IPv4 or IPv6 address' });
  }
  return res.status(200).json(result);
});
