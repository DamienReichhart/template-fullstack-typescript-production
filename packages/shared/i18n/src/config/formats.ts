/** Shared ICU formats, usable as `t('key', { date }, formats)` or via next-intl's `formats`. */
export const formats = {
  dateTime: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' },
  },
  number: {
    precise: { maximumFractionDigits: 2 },
  },
} as const;
