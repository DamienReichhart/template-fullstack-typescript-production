/** Time as a dependency: inject a `Clock` instead of calling `new Date()` in business code. */
export abstract class Clock {
  abstract now(): Date;
}
