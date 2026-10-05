import { Module, type DynamicModule } from '@nestjs/common';
import { Clock, SystemClock } from '@template/ddd';
import { EmailRenderer, Mailer, WebLinks } from '@template/notifications-application';

import {
  notificationsConfig,
  type NotificationsConfig,
} from './config/notifications-env.schema.js';
import { UrlWebLinks } from './links/url-web-links.js';
import { mailerProvider } from './mailers/mailer.factory.js';
import { ReactEmailRenderer } from './rendering/react-email.renderer.js';

/** Binds the notifications ports. Requires `ConfigModule` with `notificationsConfig`. */
@Module({})
export class NotificationsInfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: NotificationsInfrastructureModule,
      providers: [
        mailerProvider,
        { provide: EmailRenderer, useClass: ReactEmailRenderer },
        {
          provide: WebLinks,
          inject: [notificationsConfig.token],
          useFactory: (config: NotificationsConfig) => new UrlWebLinks(config.WEB_APP_URL),
        },
        { provide: Clock, useClass: SystemClock },
      ],
      exports: [Mailer, EmailRenderer, WebLinks, Clock],
    };
  }
}
