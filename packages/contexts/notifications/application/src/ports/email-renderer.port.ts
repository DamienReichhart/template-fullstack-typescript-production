import type { RenderedEmail } from '../models/email-message.ts';
import type { EmailTemplate } from '../models/email-template.ts';

/** Turns a template into a localised subject, HTML body and plain-text body. */
export abstract class EmailRenderer {
  abstract render(template: EmailTemplate): Promise<RenderedEmail>;
}
