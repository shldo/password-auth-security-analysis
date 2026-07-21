# Report Outline

## 1. Introduction

- Project problem: password security is often reduced to complexity rules.
- Security engineering angle: evaluate the whole authentication chain.
- Research question: how do password policy, storage method, and offline cracking cost affect password exposure risk after a database leak?
- Report-only extension: where would MFA fit after the measured password-cracking stage, and why was it not tested in this project?

## 2. Scope and Case Study Scenario

- Case-study system: a small web service with password-based login.
- Assumption: the user database is leaked.
- Goal: evaluate which authentication controls reduce risk most effectively.

## 3. Background Research

- NIST password verifier guidance.
- OWASP Password Storage Cheat Sheet.
- OWASP Authentication and Credential Stuffing guidance.
- Key concepts: hashing, salting, adaptive password hashing, password blocklists, and MFA as a non-experimental follow-up control.
- Detailed notes: `docs/research-notes.md`

## 4. Threat Model

- Asset: user accounts and stored password records.
- Attacker: has a leaked password database and can run offline guesses.
- Attack path for the experiment: leak database, crack password hashes, compare exposure and cracking cost.
- Out of scope: attacking real services, phishing real users, collecting real credentials.
- Detailed model: `docs/threat-model.md`
- MFA analysis note: `docs/mfa-risk-model.md`

## 5. Methodology

- Create fake users and fake passwords.
- Store the same passwords using plaintext, salted SHA-256, bcrypt, and Argon2id.
- Run the same wordlist against each method.
- Measure cracking success rate, time to first crack, average verification time, and guesses per second.
- Compare password policy rules using the same password set.

## 6. Implementation

- `scripts/generate_results.py` generates hashes, runs the attack simulation, evaluates policies, and writes results.
- `dashboard/` presents the attack chain and results for demonstration.
- `data/` contains synthetic passwords and a local demonstration wordlist.

## 7. Results and Analysis

- Which storage methods exposed passwords fastest?
- Which users were cracked under each method?
- Which password policies rejected weak or predictable passwords?
- What trade-offs appeared between security and usability?
- Where would MFA fit after the measured cracking stage, and why is it discussed qualitatively rather than tested?

## 8. Final Assessment

- Support long password phrases that are practical for the target system.
- Block common, breached, and context-specific passwords.
- Store passwords with Argon2id or bcrypt, not plaintext or fast general-purpose hashes.
- Discuss MFA for high-risk accounts and sensitive actions as a follow-up control, not as an experimental result.
- Treat account recovery as part of the authentication system.

## 9. Reflection

- What was technically challenging?
- What assumptions limited the experiment?
- What would be improved with more time?
- What professional and ethical boundaries were maintained?

## 10. Conclusion

- Password complexity alone is a weak security objective.
- A layered password-authentication design changes attacker cost and reduces password exposure risk after a database leak.

## References

See `docs/references.md`.
