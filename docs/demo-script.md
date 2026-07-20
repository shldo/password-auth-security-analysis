# Dashboard Demo Script

Use this as the presentation story. The audience is a non-technical client.

## Opening

"You currently require complex passwords, so the system looks secure. I tested what happens if the user database is leaked. The key question is not just whether passwords look complex, but whether the whole authentication chain reduces attacker success."

Before moving through the stages, click **Start simulation**. The dashboard will step through the database-leak attack chain automatically.

## Step 1: Client Baseline

Show the current design:

- complexity rule
- salted SHA-256 storage
- optional MFA
- no breached-password check

Client message:

"This is a common design. It is better than plaintext, but it still has gaps after a database leak."

## Step 2: Password Types

Show password forms rather than individual users.

Client message:

"Some password forms satisfy complexity rules but remain predictable, such as `Password123!` or `Summer2026!`. A better policy should block common and context-specific patterns while allowing long no-space phrases."

## Step 3: Database Leak

Switch between storage methods.

Client message:

"If plaintext is leaked, passwords are directly exposed. If SHA-256 is leaked, the attacker still needs to guess, but each guess is very cheap. bcrypt and Argon2id make each offline guess more expensive."

## Step 4: Offline Cracking

Show the two-second attack budget chart.

Client message:

"Using the same password samples, same wordlist, and same attack budget, fast storage methods allow many more guesses. The security value of bcrypt and Argon2id is that they change the attacker's cost."

## Step 5: Login Risk

Switch methods and show cracked passwords with MFA outcomes.

Client message:

"Hashing affects whether the password is cracked. MFA affects whether a cracked password becomes account takeover. These controls protect different stages of the same attack chain."

## Step 6: Recommendation

Show final recommendation.

Client message:

"The recommendation is a layered authentication design: long-password-friendly policy, blocklists, Argon2id or bcrypt, MFA, and secure recovery. Password complexity alone is not enough."

## Ethical Boundary

"This project uses synthetic data only. I did not attack any real service or handle real credentials."
