import ms from './ms';
import { sleep } from './sleep';

export async function requestWithRepeatDelay<T>(
  req: () => Promise<T>,
  repeat = 1,
  delayMs = ms('1s'),
): Promise<T> {
  for (let i = 0; true; i++) {
    try {
      return await req();
    } catch (e) {
      if (i < repeat) {
        await sleep(delayMs);
        continue;
      }
      throw e;
    }
  }
}
