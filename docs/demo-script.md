# Dashboard Demo Script

Use this as the presentation story for the tutor. The audience should understand that this is a controlled case-study demonstration, not an assessment of a real external system.

## Opening

"You currently require complex passwords, so the system looks secure. I tested what happens if the user database is leaked. The key question is not just whether passwords look complex, but whether the whole authentication chain reduces attacker success."

Before moving through the stages, click **Run demo**. The dashboard will step through the database-leak attack chain automatically.

## Step 1: Case Setup

Show the controlled case-study setup:

- complexity rule
- salted SHA-256 storage
- no breached-password check
- synthetic users and passwords
- fixed local wordlist and attack budget

Presentation message:

"This is not a real-user password study. I constructed a safe, repeatable case study so I can compare how each authentication control changes one stage of the attack chain."

## Step 2: Policy Effect

Show the policy decision matrix and password forms rather than individual users.

Presentation message:

"This step tests the first control point: password policy. The matrix shows that some password forms satisfy complexity rules but remain predictable, such as `Password123!` or `Summer2026!`. A better policy should block common and context-specific patterns while allowing long password phrases."

## Step 3: Storage Exposure

Switch between storage methods.

Presentation message:

"This step tests the second control point: storage. If plaintext is leaked, passwords are directly exposed. If SHA-256 is leaked, the attacker still needs to guess, but each guess is very cheap. bcrypt and Argon2id make each offline guess more expensive."

## Step 4: Cracking Cost

Show the speed ratio, cracked-account chart, guessing-speed chart, and account-level outcome matrix.

Presentation message:

"This is the main measured technical experiment. Using the same password samples, same wordlist, and same attack budget, fast storage methods allow many more guesses. The account matrix shows which synthetic accounts were exposed or cracked under each method. The security value of bcrypt and Argon2id is that they change the attacker's cost."

## Step 5: Layered Outcome

Show the final assessment and recommended layered design.

Presentation message:

"The recommendation is a layered authentication design for the measured password path: long-password-friendly policy, blocklists, and Argon2id or bcrypt. MFA is discussed in the report as a separate login-stage control, but I do not present it as a tested result."

## Ethical Boundary

"This project uses synthetic data only. I did not attack any real service or handle real credentials."
