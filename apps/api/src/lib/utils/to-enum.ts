export function isEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown,
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as any);
}

/**
 * Safe converter: casts a value to an enum member, throws if invalid
 */
export function toEnumValue<T extends Record<string, string | number>>(
  enumObj: T,
  value: unknown,
): T[keyof T] {
  if (!isEnumValue(enumObj, value)) {
    throw new Error(`Invalid enum value: ${value}`);
  }
  return value;
}
