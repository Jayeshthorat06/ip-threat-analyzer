import { rateLimit } from 'express-rate-limit';

/** Per-process limiter for this demo. Use a shared store for multi-instance production deployments. */
export function createApiRateLimiter(limit = 30, windowMs = 60_000) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests; try again later.' },
    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json(options.message);
    }
  });
}

export const apiRateLimiter = createApiRateLimiter();
