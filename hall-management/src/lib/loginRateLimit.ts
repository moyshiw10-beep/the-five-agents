const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;

type Bucket = { count: number; resetAt: number };

const failures = new Map<string, Bucket>();

function keyFor(email: string) {
  return email.toLowerCase().trim();
}

export function isLoginRateLimited(email: string, now = Date.now()): boolean {
  const bucket = failures.get(keyFor(email));
  if (!bucket || bucket.resetAt <= now) return false;
  return bucket.count >= MAX_FAILURES;
}

export function recordLoginFailure(email: string, now = Date.now()): void {
  const key = keyFor(email);
  const existing = failures.get(key);
  if (!existing || existing.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  existing.count += 1;
}

export function clearLoginFailures(email: string): void {
  failures.delete(keyFor(email));
}

export function resetLoginFailuresForTests(): void {
  failures.clear();
}

export const LOGIN_RATE_LIMIT = { WINDOW_MS, MAX_FAILURES };
