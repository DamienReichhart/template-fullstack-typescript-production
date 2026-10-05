import { Clock } from './clock.ts';

export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
