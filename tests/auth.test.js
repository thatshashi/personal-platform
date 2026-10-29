const test = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

test('Password Hashing: generates unique salts and verifies valid password', () => {
  const password = 'CorrectHorseBatteryStaple123!';
  const hash1 = hashPassword(password);
  const hash2 = hashPassword(password);

  assert.notStrictEqual(hash1, hash2, 'Salts must be unique across hashes of the same password');
  assert.strictEqual(verifyPassword(password, hash1), true, 'Password must verify against hash1');
  assert.strictEqual(verifyPassword(password, hash2), true, 'Password must verify against hash2');
});

test('Password Hashing: rejects incorrect password or corrupted hash', () => {
  const password = 'ValidSecurePassword123';
  const hash = hashPassword(password);

  assert.strictEqual(verifyPassword('WrongPassword123', hash), false, 'Wrong password must be rejected');
  assert.strictEqual(verifyPassword(password, 'invalid:hash'), false, 'Corrupted hash must be rejected');
  assert.strictEqual(verifyPassword(password, ''), false, 'Empty hash must be rejected');
});

test('Rate Limiter: enforces threshold per time window', () => {
  const rateLimitMap = new Map();
  function checkLimit(key, maxAttempts = 3, windowSec = 2) {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowSec * 1000 });
      return true;
    }
    if (entry.count >= maxAttempts) {
      return false;
    }
    entry.count += 1;
    return true;
  }

  const key = 'test_ip_127.0.0.1';
  assert.strictEqual(checkLimit(key, 3, 1), true, 'Attempt 1 permitted');
  assert.strictEqual(checkLimit(key, 3, 1), true, 'Attempt 2 permitted');
  assert.strictEqual(checkLimit(key, 3, 1), true, 'Attempt 3 permitted');
  assert.strictEqual(checkLimit(key, 3, 1), false, 'Attempt 4 blocked by rate limit');
});
