import { Clock } from './clock.js';

export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
