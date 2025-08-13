import { now } from 'src/lib/utils/now';

export function getExpirationDate({
  createdAt,
  maxWaitTimeMs,
}: {
  createdAt: Date;
  maxWaitTimeMs: number;
}): Date {
  return new Date(createdAt.getTime() + maxWaitTimeMs);
}

export function hasReachedMinBlockConfirmations({
  currentBlockConfirmations,
  minBlockConfirmations,
}: {
  currentBlockConfirmations: number;
  minBlockConfirmations: number;
}): boolean {
  return currentBlockConfirmations >= minBlockConfirmations;
}

export function hasExceededMaxWaitTime({
  createdAt,
  maxWaitTimeMs,
}: {
  createdAt: Date;
  maxWaitTimeMs: number;
}): boolean {
  const expiration = getExpirationDate({ createdAt, maxWaitTimeMs });
  return now() > expiration;
}
