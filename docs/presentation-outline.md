# Five-Minute Presentation Outline

## Slide 1: Project Question

"Is password security mainly about complexity, or about the whole authentication chain after a database leak?"

## Slide 2: Dashboard Flow

Show the five dashboard views:

Overview -> Password Types -> Attack Setup -> Results -> Findings.

## Slide 3: Controlled Experiment

- Synthetic password samples.
- Local wordlist.
- Selectable attack window.
- Four storage methods: plaintext, salted SHA-256, bcrypt, Argon2id.
- Metrics: recovered accounts, guesses per second, verification time, and account-level outcome.

## Slide 4: Password Types

Use the password gallery and policy matrix:

- Complex-looking passwords can still be predictable.
- Long joined phrases can be more usable and harder to guess.
- A layered policy performs better than a simple complexity rule.

## Slide 5: Attack Results

Use the Results view:

- Plaintext is immediate exposure.
- SHA-256 is fast to guess offline.
- bcrypt and Argon2id reduce recovered accounts under the same attack window.

## Slide 6: Final Findings

Password authentication should be layered:

- block common and context-specific passwords
- allow practical long password phrases
- never store plaintext
- prefer Argon2id or bcrypt over fast general-purpose hashes
- keep limitations clear, including controls not tested in the dashboard
