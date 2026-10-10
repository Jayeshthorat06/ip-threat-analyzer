# IP Threat Analyzer API

A small TypeScript/Express API used to evaluate AI-assisted code review. The service demonstrates input validation, transparent risk scoring, and request throttling. It does **not** query live threat-intelligence providers; its scores are based only on caller-supplied signals.

## Requirements

- Node.js 20 or later
- npm

## Run

```bash
npm install
npm test
npm run dev
```

Health check: `GET http://localhost:3000/health`

## Pull request plan

1. **PR 1 — Validate IP addresses**: add IPv4/IPv6 validation and tests.
2. **PR 2 — Add threat scoring**: add a documented deterministic scoring model and `/analyze` endpoint.
3. **PR 3 — Rate-limit API requests**: add request throttling and integration tests.

Each PR should be opened separately and reviewed by Codzee before merging.
