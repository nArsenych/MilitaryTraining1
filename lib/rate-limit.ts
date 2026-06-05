import { db } from "./db";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(
  userId: string,
  action: string,
  { maxRequests, windowMs }: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${userId}:${action}`;
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - windowMs);
  const fallback: RateLimitResult = { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now.getTime() + windowMs) };

  try {
    const record = await db.rateLimit.findUnique({ where: { key } });

    if (!record || record.windowStart < windowCutoff) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
      return fallback;
    }

    if (record.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.windowStart.getTime() + windowMs),
      };
    }

    await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      remaining: maxRequests - record.count - 1,
      resetAt: new Date(record.windowStart.getTime() + windowMs),
    };
  } catch {
    return fallback;
  }
}

export function rateLimitResetMinutes(resetAt: Date): number {
  return Math.ceil((resetAt.getTime() - Date.now()) / 60_000);
}
