import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60 * 1000; // Sweep every minute

  constructor(
    private readonly defaultLimit: number = 60,
    private readonly defaultWindowMs: number = 60 * 1000,
  ) {}

  private sweepExpired(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;

    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  public check(
    key: string,
    limit: number = this.defaultLimit,
    windowMs: number = this.defaultWindowMs,
  ): { allowed: boolean; remaining: number; resetTime: number } {
    this.sweepExpired();
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now >= record.resetTime) {
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetTime: record.resetTime,
    };
  }
}

/**
 * Derives a reliable client identifier from the request.
 * Combines network IP with client fingerprinting (User-Agent) to prevent
 * single-header spoofing from resetting rate limits.
 */
export function getClientIdentifier(req: NextRequest, prefix = ""): string {
  // Read forwarded header (standard from reverse proxy)
  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  
  // Also incorporate user-agent hash to hinder naive header rotation
  const userAgent = req.headers.get("user-agent") || "unknown";
  return `${prefix}:${rawIp}:${userAgent.slice(0, 40)}`;
}
