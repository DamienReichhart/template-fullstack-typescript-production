import { FixedClock } from '@template/ddd';

import { FakeEmailRenderer } from './fake-email-renderer.ts';
import { FakeMailer } from './fake-mailer.ts';
import { FakeWebLinks } from './fake-web-links.ts';

export function createNotificationsTestKit() {
  return {
    clock: new FixedClock(),
    mailer: new FakeMailer(),
    renderer: new FakeEmailRenderer(),
    links: new FakeWebLinks(),
  };
}
