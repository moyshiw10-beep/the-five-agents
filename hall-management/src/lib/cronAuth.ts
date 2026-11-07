import { timingSafeEqual } from "crypto";

/** בודק כותרת Authorization מול CRON_SECRET בלי להדליף את הסוד בהשוואת זמן. */
export function isCronAuthorized(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(authorization);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
