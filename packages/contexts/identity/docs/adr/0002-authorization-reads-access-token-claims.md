# Authorization reads the Access token's claims, not the database

Guards trust the role and verified-email claims of the Access token, so authorizing a request costs no database query. A change to those facts (Email verification, a role change) takes effect at the next Rotation, which the web app forces right after verifying; and a Revocation, including the one a Password reset causes, stops a Session from refreshing but leaves its current Access token valid until it expires, at most 15 minutes.
