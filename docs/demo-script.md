# Dashboard Demo Script

Use this as the presentation story for the tutor. The audience should understand that this is a controlled case-study demonstration, not an assessment of a real external system.

## Opening

"You currently require complex passwords, so the system looks secure. I tested what happens if the user database is leaked. The key question is not just whether passwords look complex, but whether the whole authentication chain reduces attacker success."

Before moving through the stages, click **Start simulation**. The dashboard will step through the database-leak attack chain automatically.

## Step 1: Case Setup

Show the controlled case-study setup:

- complexity rule
- salted SHA-256 storage
- optional MFA
- no breached-password check
- synthetic users and passwords
- fixed local wordlist and attack budget

Presentation message:

"This is not a real-user password study. I constructed a safe, repeatable case study so I can compare how each authentication control changes one stage of the attack chain."

## Step 2: Policy Effect

Show password forms rather than individual users.

Presentation message:

"This step tests the first control point: password policy. Some password forms satisfy complexity rules but remain predictable, such as `Password123!` or `Summer2026!`. A better policy should block common and context-specific patterns while allowing long password phrases."

## Step 3: Storage Exposure

Switch between storage methods.

Presentation message:

"This step tests the second control point: storage. If plaintext is leaked, passwords are directly exposed. If SHA-256 is leaked, the attacker still needs to guess, but each guess is very cheap. bcrypt and Argon2id make each offline guess more expensive."

## Step 4: Cracking Cost

Show the two-second attack budget chart.

Presentation message:

"This is the main measured technical experiment. Using the same password samples, same wordlist, and same attack budget, fast storage methods allow many more guesses. The security value of bcrypt and Argon2id is that they change the attacker's cost."

## Step 5: MFA Scenario

Switch methods and show cracked passwords with three MFA risk-model scenarios: MFA off, current mixed state, and MFA required.

Presentation message:

"The MFA part is a scenario model, not a real MFA implementation. The measured part is whether the password was cracked. After that, I model whether password-only login would be possible. If MFA is off, the known password is enough in this model. If MFA is on, the login reaches a second-factor challenge. This does not prove MFA cannot be bypassed; phishing, recovery bypass, SIM swap, and MFA fatigue are limitations."

## Step 6: Layered Outcome

Show the final assessment and recommended layered design.

Presentation message:

"The recommendation is a layered authentication design: long-password-friendly policy, blocklists, Argon2id or bcrypt, MFA, and secure recovery. Password complexity alone is not enough."

## Ethical Boundary

"This project uses synthetic data only. I did not attack any real service or handle real credentials."
