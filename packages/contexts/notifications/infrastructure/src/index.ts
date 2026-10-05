export {
  MAIL_TRANSPORTS,
  notificationsConfig,
  type MailTransport,
  type NotificationsConfig,
} from './config/notifications-env.schema.ts';
export { UrlWebLinks } from './links/url-web-links.ts';
export { CaptureMailer } from './mailers/capture/capture.mailer.ts';
export { ConsoleMailer } from './mailers/console/console.mailer.ts';
export { mailerProvider } from './mailers/mailer.factory.ts';
export { MailDeliveryError, ResendMailer } from './mailers/resend/resend.mailer.ts';
export { NotificationsInfrastructureModule } from './notifications-infrastructure.module.ts';
export { ReactEmailRenderer } from './rendering/react-email.renderer.ts';
