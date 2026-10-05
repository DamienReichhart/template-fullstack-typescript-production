# Glossary Map

## Contexts

- [Identity](./packages/contexts/identity/GLOSSARY.md): who a person is to the system and how they prove it
- [Notifications](./packages/contexts/notifications/GLOSSARY.md): telling people things outside the app, in their language

## Relationships

- **Identity → Notifications**: Identity enqueues `send-welcome-email`, `send-email-verification` and `send-password-reset-email` on the `mail` queue; Notifications consumes them in the worker. Each job carries a Recipient (email, name, Preferred language) and, where needed, the One-time token: Notifications never knows Users.
