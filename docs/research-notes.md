# Research Notes

These notes connect the project experiment to current security guidance. They are written as report-ready evidence rather than as final prose.

## NIST password guidance

Source: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/

NIST's current password authenticator guidance supports the project's central argument: password policy should not be reduced to character-composition rules. It requires minimum password lengths, recommends allowing long passwords and spaces, disallows extra composition requirements, and requires checking prospective passwords against a blocklist of commonly used, expected, or compromised values.

For the dashboard demonstration, the strong examples use long joined-word passwords such as `RiverLanternMuseumOrbit`. The point is the password form: length, lower predictability, and memorability matter more than simply adding a symbol.

Relevance to this project:

- The dashboard compares a traditional complexity rule with a layered policy.
- The synthetic examples show that `Password123!` can satisfy a complexity rule while still being predictable.
- The layered policy combines length with common/context-specific password blocking.

## OWASP password storage guidance

Source: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

OWASP recommends storing passwords with strong, slow password hashing algorithms rather than plaintext, reversible encryption, or fast general-purpose hashes. The guidance identifies Argon2id as a preferred modern option, and bcrypt as acceptable for legacy systems with an adequate work factor.

Relevance to this project:

- The experiment compares plaintext, salted SHA-256, bcrypt, and Argon2id.
- Salted SHA-256 is included to show why "hashed" does not automatically mean suitable for password storage.
- bcrypt and Argon2id are included because their cost parameters directly affect offline guessing speed.

## OWASP MFA and credential stuffing guidance

Sources:

- https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html

OWASP frames MFA as a major defense against password-related attacks such as credential stuffing, password spraying, and brute force. However, it also highlights management and usability trade-offs, including lockout, recovery, dependency, and bypass issues.

Relevance to this project:

- The experiment treats MFA as a later-stage control in the attack chain.
- Password hashing reduces the chance that a leaked password hash becomes a known password.
- MFA reduces the chance that a known password becomes account takeover.
- Account recovery remains part of the security boundary because weak recovery can bypass password and MFA controls.

## OWASP Top 10 authentication failure context

Source: https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/

OWASP Top 10 A07 identifies weak authentication design issues such as weak or well-known passwords, weak credential recovery, plaintext or weakly hashed password stores, missing MFA, and automated attacks.

Relevance to this project:

- The project's attack chain maps directly to A07-style authentication failure risks.
- The final recommendation is a layered design: weak-password checks, secure password hashing, MFA, and protected recovery.

## Security engineering framing

The project is not trying to prove a universal ranking for all systems. It uses a controlled client scenario to show how different controls affect different stages of a realistic authentication attack chain.

Key distinction:

- Password policy affects which passwords users create.
- Password storage affects the cost of offline cracking after database leakage.
- MFA affects whether a cracked or reused password becomes account takeover.
- Recovery and operational controls affect whether attackers can bypass the intended authentication path.
