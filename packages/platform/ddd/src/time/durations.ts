const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const addSeconds = (date: Date, seconds: number): Date =>
  new Date(date.getTime() + seconds * SECOND);
export const addMinutes = (date: Date, minutes: number): Date =>
  new Date(date.getTime() + minutes * MINUTE);
export const addHours = (date: Date, hours: number): Date =>
  new Date(date.getTime() + hours * HOUR);
export const addDays = (date: Date, days: number): Date => new Date(date.getTime() + days * DAY);
