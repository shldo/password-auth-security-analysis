# Five-Minute Presentation Outline

## Slide 1: Project Question

"After a password database leak, how much can an offline attacker recover within a fixed attack budget?"

## Slide 2: Dashboard Flow

Show the five dashboard views:

Cost Model -> Password Set -> Attack Budget -> Results -> Findings.

## Slide 3: Controlled Experiment

- Synthetic password samples.
- Local wordlist.
- Selectable attack budget.
- Four storage methods: plaintext, salted SHA-256, bcrypt, Argon2id.
- Metrics: recovered accounts, guesses per second, verification time, and account-level outcome.

## Slide 4: Password Set

Use the password gallery and policy matrix:

- Common or patterned passwords are cheap wordlist candidates.
- Long joined phrases are harder to cover early in the wordlist.
- A layered policy performs better than a simple complexity rule.

## Slide 5: Attack Results

Use the Results view:

- Plaintext is immediate exposure.
- SHA-256 is fast to guess offline.
- bcrypt and Argon2id reduce recovered accounts under the same attack budget.

## Slide 6: Final Findings

The engineering goal is to raise offline attack cost:

- block common and context-specific passwords
- allow practical long password phrases
- never store plaintext
- prefer Argon2id or bcrypt over fast general-purpose hashes
- keep limitations clear, including controls not tested in the dashboard
