# Report Outline

## 1. Introduction

- Proposed title: Raising the Cost of Offline Password Cracking.
- Project problem: password security is often discussed as complexity, but the engineering objective after a database leak is to raise attacker cost.
- Security engineering angle: evaluate how controls change an attacker's feasible recovery result under the same budget.
- Research question: after a password database leak, how do password choice, wordlist coverage, and storage method affect the number of passwords recovered within a fixed offline attack budget?
- Report-only extension: where would MFA fit after the measured password-cracking stage, and why was it not tested in this project?

## 2. Scope and Case Study Scenario

- Case-study system: a small web service with password-based login.
- Assumption: the user database is leaked.
- Goal: evaluate which controls make offline password recovery slower or less complete.

## 3. Background Research

- NIST password verifier guidance.
- OWASP Password Storage Cheat Sheet.
- OWASP Authentication and Credential Stuffing guidance.
- Key concepts: hashing, salting, adaptive password hashing, password blocklists, and MFA as a non-experimental follow-up control.
- Detailed notes: `docs/research-notes.md`

## 4. Threat Model

- Asset: user accounts and stored password records.
- Attacker: has a leaked password database and can run offline guesses.
- Attack path for the experiment: leak database, run ordered wordlist guesses, compare recovered passwords under the same attack budget.
- Out of scope: attacking real services, phishing real users, collecting real credentials.
- Detailed model: `docs/threat-model.md`
- MFA analysis note: `docs/mfa-risk-model.md`

## 5. Methodology

- Create 64 fake users and fake passwords.
- Define a 320-candidate ordered local wordlist to represent attacker candidate priority.
- Store the same passwords using plaintext, salted SHA-256, bcrypt, and Argon2id.
- Run the same wordlist and same time budget against each method.
- Measure cracking success rate, time to first crack, average verification time, and guesses per second.
- Compare password policy rules using the same password set.

## 6. Implementation

- `scripts/generate_results.py` generates hashes, runs the attack simulation, evaluates policies, and writes results.
- `dashboard/` presents the attack chain and results for demonstration.
- `data/` contains synthetic passwords and a local demonstration wordlist.

## 7. Results and Analysis

- Which storage methods exposed passwords fastest?
- How did a fixed attack budget make storage cost visible?
- Which users were cracked under each method?
- Which password policies rejected weak or predictable passwords?
- What trade-offs appeared between security and usability?
- Where would MFA fit after the measured cracking stage, and why is it discussed qualitatively rather than tested?

## 8. Final Assessment

- Support long password phrases that are practical for the target system.
- Block common, breached, and context-specific passwords.
- Store passwords with Argon2id or bcrypt, not plaintext or fast general-purpose hashes.
- Treat attack budget as the basis for comparison: a better design makes each offline guess more expensive.
- Discuss MFA for high-risk accounts and sensitive actions as a follow-up control, not as an experimental result.
- Treat account recovery as part of the authentication system.

## 9. Reflection

- What was technically challenging?
- What assumptions limited the experiment?
- What would be improved with more time?
- What professional and ethical boundaries were maintained?

## 10. Conclusion

- Password complexity alone is a weak security objective.
- The stronger security engineering claim is that good policy and slow password storage raise offline attack cost, reducing what can be recovered within a realistic resource budget.

## References

See `docs/references.md`.
