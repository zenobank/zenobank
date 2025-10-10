import crypto from 'crypto';

export function generateApiKey(length = 40, prefix = 'api_'): string {
  const bytes = crypto.randomBytes(Math.ceil((length - prefix.length) / 2));
  const key = bytes.toString('hex').slice(0, length - prefix.length);
  return `${prefix}${key}`;
}
