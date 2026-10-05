import enAuth from '@template/i18n/messages/en/auth.json' with { type: 'json' };
import enCommon from '@template/i18n/messages/en/common.json' with { type: 'json' };
import enSystem from '@template/i18n/messages/en/system.json' with { type: 'json' };
import frAuth from '@template/i18n/messages/fr/auth.json' with { type: 'json' };
import frErrors from '@template/i18n/messages/fr/errors.json' with { type: 'json' };
import frSeo from '@template/i18n/messages/fr/seo.json' with { type: 'json' };

/**
 * Locators use the shipped translations, never copied strings: rewording a label does not
 * break a test, a missing translation does.
 */
export const en = { auth: enAuth, common: enCommon, system: enSystem };
export const fr = { auth: frAuth, errors: frErrors, seo: frSeo };
