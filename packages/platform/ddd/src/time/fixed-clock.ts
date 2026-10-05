import { Clock } from './clock.ts';

/** A controllable clock for tests: time only moves when the test says so. */
export class FixedClock extends Clock {
  #current: Date;

  constructor(start: Date = new Date('2026-01-01T00:00:00.000Z')) {
    super();
    this.#current = new Date(start);
  }

  now(): Date {
    return new Date(this.#current);
  }

  set(date: Date): void {
    this.#current = new Date(date);
  }

  advanceBy(milliseconds: number): void {
    this.#current = new Date(this.#current.getTime() + milliseconds);
  }
}
