# Five-Minute Presentation Outline

## Slide 1: Case Study Problem

"The case-study system appears safe because it requires uppercase, lowercase, numbers, and symbols. I test whether that is enough after a database leak."

## Slide 2: Attack Chain

Show the dashboard flow:

Case setup -> policy effect -> storage exposure -> cracking cost -> layered outcome.

## Slide 3: Technical Experiment

- Same synthetic password samples.
- Same wordlist.
- Four storage methods: plaintext, salted SHA-256, bcrypt, Argon2id.
- Metrics: cracked rate, verification time, guesses per second, and time to first crack.

## Slide 4: Results

Use dashboard screenshots:

- Plaintext fails immediately.
- Fast hash is much easier to test offline.
- bcrypt and Argon2id increase attacker cost.

## Slide 5: Layered Outcome

Password security should be layered:

- long password phrases
- block common or breached passwords
- Argon2id or bcrypt
- limitations and future work, including MFA as report-only analysis

## Slide 6: Reflection

- The project changed the question from "how complex should a password be?" to "what controls reduce attacker success through the whole system?"
