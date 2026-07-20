# Five-Minute Presentation Outline

## Slide 1: Client Problem

"Our client thinks their password policy is safe because it requires uppercase, lowercase, numbers, and symbols. I test whether that is enough after a database leak."

## Slide 2: Attack Chain

Show the dashboard flow:

Client baseline -> password choices -> database leak -> offline cracking -> login with/without MFA -> recommendation.

## Slide 3: Technical Experiment

- Same synthetic password samples.
- Same wordlist.
- Four storage methods: plaintext, salted SHA-256, bcrypt, Argon2id.
- Metrics: cracked rate, verification time, time to first crack, account takeover rate.

## Slide 4: Results

Use dashboard screenshots:

- Plaintext fails immediately.
- Fast hash is much easier to test offline.
- bcrypt and Argon2id increase attacker cost.
- MFA reduces account takeover after a password is cracked.

## Slide 5: Recommendation

Password security should be layered:

- long no-space password phrases
- block common or breached passwords
- Argon2id or bcrypt
- MFA
- secure account recovery

## Slide 6: Reflection

- The project changed the question from "how complex should a password be?" to "what controls reduce attacker success through the whole system?"
