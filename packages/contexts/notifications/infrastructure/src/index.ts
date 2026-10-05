export {
  MAIL_TRANSPORTS,
  notificationsConfig,
  type MailTransport,
  type NotificationsConfig,
} from './config/notifications-env.schema.js';
export { UrlWebLinks } from './links/url-web-links.js';
export { CaptureMailer } from './mailers/capture/capture.mailer.js';
export { ConsoleMailer } from './mailers/console/console.mailer.js';
export { mailerProvider } from './mailers/mailer.factory.js';
export { MailDeliveryError, ResendMailer } from './mailers/resend/resend.mailer.js';
export { NotificationsInfrastructureModule } from './notifications-infrastructure.module.js';
export { ReactEmailRenderer } from './rendering/react-email.renderer.js';
