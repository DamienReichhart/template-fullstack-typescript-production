import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import { defaultLocale, isLocale, loadMessages } from '@template/i18n';
import {
  EmailRenderer,
  type EmailTemplate,
  type RenderedEmail,
} from '@template/notifications-application';
import { createTranslator } from 'use-intl/core';

import type { Translate } from '../templates/translate.ts';
import { buildEmail } from './email-catalog.tsx';

/**
 * Renders React Email templates with the `emails` catalog of `@template/i18n`, so emails
 * and the web app share one source of translations.
 */
@Injectable()
export class ReactEmailRenderer extends EmailRenderer {
  async render(template: EmailTemplate): Promise<RenderedEmail> {
    const locale = isLocale(template.locale) ? template.locale : defaultLocale;
    const messages = await loadMessages(locale);
    const translator = createTranslator({ locale, messages, namespace: 'emails' });
    const t: Translate = (key, values) => (translator as unknown as Translate)(key, values);

    const { subject, element } = buildEmail(template, t, messages.common.appName, locale);
    const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
    return { subject, html, text };
  }
}
