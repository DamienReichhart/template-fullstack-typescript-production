import { FixedClock } from '@template/ddd';

import { FakeEmailRenderer } from './fake-email-renderer.js';
import { FakeMailer } from './fake-mailer.js';
import { FakeWebLinks } from './fake-web-links.js';

export function createNotificationsTestKit() {
  return {
    clock: new FixedClock(),
    mailer: new FakeMailer(),
    renderer: new FakeEmailRenderer(),
    links: new FakeWebLinks(),
  };
}
