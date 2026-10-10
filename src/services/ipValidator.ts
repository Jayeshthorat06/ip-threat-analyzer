import { isIP } from 'node:net';

export type IPVersion = 4 | 6;

export interface IPValidationResult {
  valid: boolean;
  version?: IPVersion;
  normalized: string;
}

/** Validate an IP literal. This does not perform DNS resolution. */
export function validateIp(value: unknown): IPValidationResult {
  if (typeof value !== 'string') {
    return { valid: false, normalized: '' };
  }

  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > 45) {
    return { valid: false, normalized };
  }

  const version = isIP(normalized);
  if (version === 4 || version === 6) {
    return { valid: true, version, normalized };
  }

  return { valid: false, normalized };
}
