# References

Initial sources to use in the final report:

- NIST. Digital Identity Guidelines, SP 800-63B: Authentication and Lifecycle Management.
- OWASP. Password Storage Cheat Sheet.
- OWASP. Authentication Cheat Sheet.
- OWASP. Credential Stuffing Prevention Cheat Sheet.
- OWASP. Multifactor Authentication Cheat Sheet.

Notes to verify before final writing:

- Current NIST guidance discourages password composition rules and recommends blocklists for common, expected, or compromised passwords.
- OWASP recommends modern adaptive password hashing such as Argon2id, bcrypt, scrypt, or PBKDF2 depending on system constraints.
- MFA reduces the impact of password compromise, but it does not remove all risks because recovery flows and phishing resistance still matter.
