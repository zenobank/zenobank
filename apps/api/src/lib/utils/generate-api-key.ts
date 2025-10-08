import { nanoid } from 'nanoid';

export function generateApiKey(length = 40, prefix = 'api_'): string {
  return `${prefix}${nanoid(length - prefix.length)}`;
}
