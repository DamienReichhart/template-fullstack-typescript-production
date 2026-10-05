# Identity

Who a person is to the system and how they prove it: accounts, credentials, signed-in
devices and the single-use links sent by email.

## Language

### Accounts

**User**:
A person who can sign in, identified by one email address.
_Avoid_: Account, member, customer, profile

**Role**:
What a User is allowed to do beyond their own data. Either `USER` or `ADMIN`.
_Avoid_: Permission, group, level

**Registration**:
The act of creating a User from a name, an email, a password and a preferred language.
_Avoid_: Sign-up, onboarding, account creation

**Verified email**:
A User's email address once its owner has proven they receive mail sent to it.
_Avoid_: Confirmed email, activated account

**Preferred language**:
The language every email to a User is written in, chosen at Registration.
_Avoid_: Locale (in conversation), language setting

### Credentials

**Password**:
The secret a User chose. The system never stores or logs it, only its hash.
_Avoid_: Passphrase, credential (when meaning the password alone)

**Credentials**:
An email and Password presented together to sign in.
_Avoid_: Login, auth data

### Sessions

**Session**:
One signed-in device of a User, alive until it expires or is revoked.
_Avoid_: Login, connection, device

**Access token**:
A short-lived proof that a request belongs to a Session's User. Never stored server-side.
_Avoid_: JWT (in conversation), bearer, auth token

**Refresh token**:
A long-lived secret that lets a Session obtain a new Access token. Replaced on every use.
_Avoid_: Session token, remember-me token

**Rotation**:
Replacing a Session's Refresh token with a new one each time it is used.
_Avoid_: Renewal, refresh (as a noun)

**Token reuse**:
Presenting a Refresh token that was already rotated away. Treated as theft: the Session is revoked.
_Avoid_: Replay (alone), double refresh

**Concurrent refresh**:
Two requests of the same Session rotating its Refresh token within seconds of each other
(several open tabs). Tolerated: the late request is refused but the Session survives.
_Avoid_: Race, refresh conflict (in conversation)

**Revocation**:
Ending a Session before it expires (sign-out, password reset, Token reuse).
_Avoid_: Logout (as a noun for the state), invalidation

### Email links

**One-time token**:
A single-use secret, bound to one purpose, sent to a User by email and valid until it expires.
_Avoid_: Code, OTP, magic link

**Email verification**:
Consuming a One-time token issued for proving ownership of the email address.
_Avoid_: Email confirmation, activation

**Password reset**:
Consuming a One-time token issued for choosing a new Password without knowing the old one.
Revokes every Session of the User.
_Avoid_: Password recovery, forgot password (as a process name)
