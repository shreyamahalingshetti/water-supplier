const crypto = require('crypto');

/**
 * Convert a 128-bit UUID string to a safe PostgreSQL bigint (64-bit integer) string.
 * Uses SHA-256 to hash the UUID and takes the first 15 hex characters.
 * This guarantees the resulting integer is positive and always fits comfortably
 * under PostgreSQL's signed bigint maximum value of 9,223,372,036,854,775,807.
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
  const hexPart = hash.slice(0, 15); // 15 hex chars = 60 bits (well under 63-bit max positive bigint)
  const bigIntValue = BigInt('0x' + hexPart);
  return bigIntValue.toString();
}

module.exports = { uuidToBigInt };
