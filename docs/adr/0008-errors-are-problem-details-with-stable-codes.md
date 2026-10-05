# Errors are RFC 9457 problem details with stable codes

Every api error is `application/problem+json` with a machine-readable `code` from `@template/contracts`, and validation errors carry i18n keys plus ICU params rather than English sentences. Clients branch on codes and translate messages themselves, so wording changes never break them; contexts map their domain errors to codes with a `DomainErrorMapper`, discovered at boot, so `http` never knows a context's errors.
