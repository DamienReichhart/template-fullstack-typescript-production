/** A rendered email, ready for a mail transport. */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Same key ⇒ same email: lets transports drop duplicates caused by job retries. */
  idempotencyKey?: string;
  /** Free-form label for logs and provider dashboards, e.g. `verify-email`. */
  tag: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}
