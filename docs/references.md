# References

Verified sources to use in the final report:

- NIST. Digital Identity Guidelines, SP 800-63B: Authentication and Lifecycle Management. https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
- OWASP. Password Storage Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP. Multifactor Authentication Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html
- OWASP. Credential Stuffing Prevention Cheat Sheet. https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html
- OWASP Top 10:2021 A07 Identification and Authentication Failures. https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/

Source-grounded notes:

- NIST supports length, blocklists, and long password support over extra composition requirements.
- OWASP recommends modern adaptive password hashing such as Argon2id, bcrypt, scrypt, or PBKDF2 depending on system constraints.
- OWASP treats MFA as a strong defense against many password-related attacks, but also highlights usability, recovery, and bypass issues.
- OWASP Top 10 A07 supports framing weak passwords, weak storage, missing MFA, credential recovery, and automated attacks as authentication failure risks.
