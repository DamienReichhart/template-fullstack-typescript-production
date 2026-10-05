# Users can sign in before verifying their email

Registration signs the User in immediately and Email verification is not required to sign in; instead, endpoints that need a Verified email say so with `@RequireVerifiedEmail()` and answer `403 EMAIL_NOT_VERIFIED`. A lost or delayed email never locks a person out of their account, and each feature decides how much trust it needs.
