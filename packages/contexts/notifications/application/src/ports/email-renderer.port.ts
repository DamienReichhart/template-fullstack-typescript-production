import type { RenderedEmail } from '../models/email-message.js';
import type { EmailTemplate } from '../models/email-template.js';

/** Turns a template into a localised subject, HTML body and plain-text body. */
export abstract class EmailRenderer {
  abstract render(template: EmailTemplate): Promise<RenderedEmail>;
}
