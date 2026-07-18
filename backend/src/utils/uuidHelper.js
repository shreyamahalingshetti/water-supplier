const crypto = require('crypto');

/**
 * Convert a 128-bit UUID string to a safe PostgreSQL bigint (64-bit integer) string.
 * Uses SHA-256 to hash the UUID and takes the first 12 hex characters (48 bits).
 *
 * IMPORTANT: We use only 12 hex chars (48 bits, max value ~281 trillion) to guarantee
 * the result is always below Number.MAX_SAFE_INTEGER (2^53 - 1 = ~9 quadrillion).
 * This prevents JavaScript from silently losing precision when PostgREST returns
 * these BigInt IDs as JSON numbers.
 *
 * Using 15 hex chars (60 bits) caused IDs like 150684972944928108 to be truncated
 * to 150684972944928100 by JS JSON.parse, breaking customer_id lookups.
 */
function uuidToBigInt(val) {
  if (!val) return val;
  if (typeof val !== 'string') return val;
  
  // If it's already a numeric string, return it as-is
  if (/^\d+$/.test(val)) return val;
  
  // Check if it matches UUID format (8-4-4-4-12 hex chars)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
  if (!isUuid) return val;

  const hash = crypto.createHash('sha256').update(val).digest('hex');
  const hexPart = hash.slice(0, 12); // 12 hex chars = 48 bits (always under 2^53, JS-safe)
  const bigIntValue = BigInt('0x' + hexPart);
  return bigIntValue.toString();
}

module.exports = { uuidToBigInt };

