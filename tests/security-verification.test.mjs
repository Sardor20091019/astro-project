import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Test cookie signing and unsigning logic
const TEST_SECRET = "test-super-secret-key-for-security-audit-12345";

function signCookie(val, secret = TEST_SECRET) {
  const sig = crypto
    .createHmac("sha256", secret)
    .update(val)
    .digest("base64")
    .replace(/=+$/, "");
  return `s:${val}.${sig}`;
}

function unsignCookie(val, secret = TEST_SECRET) {
  if (!secret || typeof val !== "string" || !val.startsWith("s:")) return false;
  const str = val.slice(2);
  const dotIndex = str.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const rawValue = str.slice(0, dotIndex);
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawValue)
    .digest("base64")
    .replace(/=+$/, "");
  const actualSig = str.slice(dotIndex + 1);
  if (
    expectedSig.length === actualSig.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(actualSig))
  ) {
    return rawValue;
  }
  return false;
}

function parseCookieValue(rawVal, secret = TEST_SECRET) {
  if (!rawVal || typeof rawVal !== "string") return null;
  if (rawVal.startsWith("s:")) {
    const unsigned = unsignCookie(rawVal, secret);
    return unsigned ? unsigned : null;
  }
  return null;
}

describe("Security Test Suite: Cookie Signing & Impersonation Defense", () => {
  test("Reject raw, unsigned cookie (prevents admin account impersonation)", () => {
    const rawAttackerUserId = "550e8400-e29b-41d4-a716-446655440000";
    const parsed = parseCookieValue(rawAttackerUserId);
    assert.equal(parsed, null, "Raw unsigned user_session cookie MUST be rejected");
  });

  test("Reject tampered signed cookie", () => {
    const validUserId = "550e8400-e29b-41d4-a716-446655440000";
    const signedCookie = signCookie(validUserId, TEST_SECRET);
    // Tamper with the payload
    const tampered = signedCookie.replace("550e", "dead");
    const parsed = parseCookieValue(tampered, TEST_SECRET);
    assert.equal(parsed, null, "Tampered cookie signature MUST be rejected");
  });

  test("Reject cookie signed with wrong secret", () => {
    const validUserId = "550e8400-e29b-41d4-a716-446655440000";
    const forgedCookie = signCookie(validUserId, "wrong-secret-key");
    const parsed = parseCookieValue(forgedCookie, TEST_SECRET);
    assert.equal(parsed, null, "Cookie signed with forged secret MUST be rejected");
  });

  test("Accept legitimately signed cookie with correct secret", () => {
    const legitimateId = "550e8400-e29b-41d4-a716-446655440000";
    const validSignedCookie = signCookie(legitimateId, TEST_SECRET);
    const parsed = parseCookieValue(validSignedCookie, TEST_SECRET);
    assert.equal(parsed, legitimateId, "Legitimately signed cookie MUST resolve successfully");
  });
});

describe("Security Test Suite: Input Sanitization", () => {
  function sanitizePlainText(input, maxLength = 1000) {
    if (typeof input !== "string" && typeof input !== "number") {
      return "";
    }
    const str = String(input);
    const cleaned = str
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      .replace(/[<>]/g, "")
      .trim();
    return cleaned.slice(0, maxLength);
  }

  test("Strips HTML tags and script elements", () => {
    const payload = "<script>alert('xss')</script>Hello World";
    const cleaned = sanitizePlainText(payload);
    assert.equal(cleaned, "scriptalert('xss')/scriptHello World");
    assert.equal(cleaned.includes("<"), false);
    assert.equal(cleaned.includes(">"), false);
  });

  test("Strips null bytes and control characters", () => {
    const payload = "Hello\u0000World\u0007!";
    const cleaned = sanitizePlainText(payload);
    assert.equal(cleaned, "HelloWorld!");
  });

  test("Truncates input exceeding max length", () => {
    const longString = "A".repeat(500);
    const cleaned = sanitizePlainText(longString, 50);
    assert.equal(cleaned.length, 50);
  });
});

describe("Security Test Suite: Memory Rate Limiter", () => {
  class MemoryRateLimiter {
    constructor(defaultLimit = 5, defaultWindowMs = 1000) {
      this.store = new Map();
      this.defaultLimit = defaultLimit;
      this.defaultWindowMs = defaultWindowMs;
    }

    check(key, limit = this.defaultLimit, windowMs = this.defaultWindowMs) {
      const now = Date.now();
      const record = this.store.get(key);

      if (!record || now >= record.resetTime) {
        const resetTime = now + windowMs;
        this.store.set(key, { count: 1, resetTime });
        return { allowed: true, remaining: limit - 1 };
      }

      if (record.count >= limit) {
        return { allowed: false, remaining: 0 };
      }

      record.count += 1;
      return { allowed: true, remaining: limit - record.count };
    }
  }

  test("Allows requests within rate limit", () => {
    const limiter = new MemoryRateLimiter(3, 1000);
    const r1 = limiter.check("client-1");
    const r2 = limiter.check("client-1");
    const r3 = limiter.check("client-1");

    assert.equal(r1.allowed, true);
    assert.equal(r2.allowed, true);
    assert.equal(r3.allowed, true);
  });

  test("Blocks requests exceeding rate limit", () => {
    const limiter = new MemoryRateLimiter(2, 1000);
    limiter.check("client-2");
    limiter.check("client-2");
    const r3 = limiter.check("client-2");

    assert.equal(r3.allowed, false, "Third request should be blocked by rate limiter");
  });
});
