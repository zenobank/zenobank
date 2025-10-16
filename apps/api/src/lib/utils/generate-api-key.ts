import crypto from 'crypto';

export function generateApiKey(length = 30, prefix = 'sk_'): string {
  const bytes = crypto.randomBytes(Math.ceil((length - prefix.length) / 2));
  const key = bytes.toString('hex').slice(0, length - prefix.length);
  return `${prefix}${key}`;
}
