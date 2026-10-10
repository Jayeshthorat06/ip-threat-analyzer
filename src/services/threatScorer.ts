export interface ThreatSignals {
  onBlocklist?: boolean;
  failedLogins?: number;
  requestsPerMinute?: number;
}

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatAssessment {
  score: number;
  level: ThreatLevel;
  reasons: string[];
}

function validCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isInteger(value);
}

/** Deterministic demo scoring; this is not a substitute for a reputation feed. */
export function scoreThreat(signals: ThreatSignals): ThreatAssessment {
  let score = 0;
  const reasons: string[] = [];

  if (signals.onBlocklist === true) {
    score += 60;
    reasons.push('IP is marked as blocklisted by the supplied signal');
  }
  if (signals.failedLogins !== undefined) {
    if (!validCount(signals.failedLogins)) throw new Error('failedLogins must be a non-negative integer');
    if (signals.failedLogins >= 10) {
      score += 25;
      reasons.push('High number of failed login attempts');
    } else if (signals.failedLogins >= 3) {
      score += 10;
      reasons.push('Repeated failed login attempts');
    }
  }
  if (signals.requestsPerMinute !== undefined) {
    if (!validCount(signals.requestsPerMinute)) throw new Error('requestsPerMinute must be a non-negative integer');
    if (signals.requestsPerMinute >= 600) {
      score += 25;
      reasons.push('Very high request rate');
    } else if (signals.requestsPerMinute >= 120) {
      score += 10;
      reasons.push('Elevated request rate');
    }
  }

  score = Math.min(score, 100);
  const level: ThreatLevel = score >= 80 ? 'critical' : score >= 50 ? 'high' : score >= 20 ? 'medium' : 'low';
  if (reasons.length === 0) reasons.push('No elevated risk indicated by the supplied signals');
  return { score, level, reasons };
}
