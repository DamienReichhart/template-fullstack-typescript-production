# Glossary Map

## Contexts

- [Identity](./packages/contexts/identity/GLOSSARY.md): who a person is to the system and how they prove it: Users, Sessions, Email verification, Password reset and Avatars
- [Notifications](./packages/contexts/notifications/GLOSSARY.md): telling people things outside the app in their Preferred language: Rendering Transactional emails and handing them to a Transport

## Relationships

- **Identity → Notifications**: Identity enqueues `send-welcome-email`, `send-email-verification` and `send-password-reset-email` on the `mail` queue when a User registers, asks for a new verification link or requests a Password reset; Notifications consumes them in the worker and renders each Template for its Recipient. A job carries the Recipient (email, name, Preferred language), plus the One-time token and its expiry when the email holds a link: Notifications never knows Users.
- **Identity ↔ Notifications**: Shared types for the mail job payloads only (`@template/queue`); neither context imports the other.
