# Notifications

Telling people things outside the app: writing messages in their language and delivering
them. Today only transactional emails.

## Language

**Notification**:
A message sent to a person outside the app because something happened to them.
_Avoid_: Alert, message (alone), communication

**Transactional email**:
A Notification sent by email in direct response to a person's own action (registering,
asking for a reset link). Never marketing.
_Avoid_: System email, automated email

**Template**:
The content of one kind of Notification (welcome, email verification, password reset),
before it is written in a language.
_Avoid_: Layout, design

**Rendering**:
Writing a Template in the recipient's language, as a subject, an HTML body and a plain-text body.
_Avoid_: Templating, compiling

**Recipient**:
The person a Notification is for: an email address, a name and a preferred language.
_Avoid_: Target, addressee, user (notifications does not know Users)

**Transport**:
The way a rendered email leaves the system: a real provider, the logs, or a test outbox.
_Avoid_: Provider (when meaning the local choice), driver, channel

**Outbox**:
Where the capture Transport keeps emails so automated tests can read them.
_Avoid_: Mailbox, inbox, spool
