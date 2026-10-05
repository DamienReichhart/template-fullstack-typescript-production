export const OneTimeTokenPurposes = ['EMAIL_VERIFICATION', 'PASSWORD_RESET'] as const;

/** What a one-time token proves. A token issued for one purpose never works for another. */
export type OneTimeTokenPurpose = (typeof OneTimeTokenPurposes)[number];
