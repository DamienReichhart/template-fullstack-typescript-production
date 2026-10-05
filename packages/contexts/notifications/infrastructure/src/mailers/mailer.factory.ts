import type { Provider } from '@nestjs/common';
import { Mailer } from '@template/notifications-application';
import { REDIS_CLIENT, type Redis } from '@template/redis';
import { Resend } from 'resend';

import {
  notificationsConfig,
  type NotificationsConfig,
} from '../config/notifications-env.schema.js';
import { CaptureMailer } from './capture/capture.mailer.js';
import { ConsoleMailer } from './console/console.mailer.js';
import { ResendMailer } from './resend/resend.mailer.js';

/** Binds `Mailer` to the transport chosen by `MAIL_TRANSPORT`. */
export const mailerProvider: Provider = {
  provide: Mailer,
  inject: [notificationsConfig.token, { token: REDIS_CLIENT, optional: true }],
  useFactory: (config: NotificationsConfig, redis?: Redis): Mailer => {
    switch (config.MAIL_TRANSPORT) {
      case 'resend':
        return new ResendMailer(new Resend(config.RESEND_API_KEY), config.MAIL_FROM);
      case 'console':
        return new ConsoleMailer();
      case 'capture':
        if (!redis) throw new Error('MAIL_TRANSPORT=capture requires RedisModule');
        return new CaptureMailer(redis);
    }
  },
};
