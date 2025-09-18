import { ClassConstructor, plainToInstance } from 'class-transformer';

type Plain<T> = {
  [K in keyof T]: T[K] extends Date
    ? string | Date
    : T[K] extends (infer U)[]
      ? Plain<U>[]
      : T[K] extends object
        ? Plain<T[K]>
        : T[K];
};

export function toDto<T>(cls: ClassConstructor<T>, obj: Plain<T>): T {
  return plainToInstance(cls, obj, { excludeExtraneousValues: true });
}
