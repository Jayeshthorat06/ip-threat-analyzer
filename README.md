# IP Threat Analyzer API

A small TypeScript/Express API used to evaluate AI-assisted code review. The service demonstrates input validation, transparent risk scoring, and request throttling. It does **not** query live threat-intelligence providers; its scores are based only on caller-supplied signals.

## Requirements

* Node.js 20 or later
* npm

## Run

```bash
npm install
npm test
npm run dev
```

Health check: http://localhost:3000/health

## Reverse Proxy Configuration

The API rate limiter identifies clients using their IP addresses.

If the application runs directly without a reverse proxy, no additional proxy configuration is required.

If the application runs behind a trusted reverse proxy or load balancer, configure `TRUST_PROXY_HOPS` to match the number of trusted proxy hops between the client and the application.

For example, when the deployment uses exactly one trusted proxy:

```bash
TRUST_PROXY_HOPS=1 npm run dev
```

Set this value only when the proxy topology is understood and the trusted proxy correctly overwrites incoming forwarded-IP headers. Do not enable proxy trust indiscriminately, because untrusted forwarded headers can allow clients to spoof their apparent IP addresses and bypass IP-based rate limiting.

For multiple proxies or deployments with different network paths, configure the appropriate trusted topology instead of guessing the hop count.

If `TRUST_PROXY_HOPS` is not configured, Express retains its default proxy trust behavior.

## Pull Request Plan

1. **PR 1 — Validate IP addresses:** Add IPv4/IPv6 validation and tests.
2. **PR 2 — Add threat scoring:** Add a documented deterministic scoring model and the `/analyze` endpoint.
3. **PR 3 — Rate-limit API requests:** Add request throttling and integration tests.

Each PR should be opened separately and reviewed by Codzee before merging.
