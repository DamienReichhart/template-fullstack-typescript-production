import type { RenderedEmail } from '../models/email-message.ts';
import type { EmailTemplate } from '../models/email-template.ts';
import { EmailRenderer } from '../ports/email-renderer.port.ts';

export class FakeEmailRenderer extends EmailRenderer {
  readonly rendered: EmailTemplate[] = [];

  async render(template: EmailTemplate): Promise<RenderedEmail> {
    this.rendered.push(template);
    return { subject: `[${template.locale}] ${template.kind}`, html: '<p>html</p>', text: 'text' };
  }
}
