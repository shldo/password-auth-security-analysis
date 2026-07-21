# Dashboard Demo Script

Use this as the 5-minute tutor presentation story. Keep the speech short and let the dashboard visuals carry the evidence.

## Opening

"This project asks whether password security is only about complexity. I built a controlled password-leak lab to compare password types, storage methods, and offline attack cost."

Click **Run demo** if you want the dashboard to move through the five views automatically.

## 1. Overview

Show the attack chain:

Password type -> database leak -> offline guesses -> recovered passwords.

Message:

"This is not an attack on a real system. The dataset is synthetic, the wordlist is local, and every method is compared under the same controlled conditions."

## 2. Password Types

Show the password gallery and policy matrix.

Message:

"This page separates password form from password strength. Some passwords look complex but follow common patterns. The policy matrix shows why complexity rules can accept weak passwords while rejecting useful long phrases."

## 3. Attack Setup

Choose the attack window and storage method.

Message:

"Here I choose how much time the offline attacker gets and what storage method was leaked. The leaked view shows what the attacker receives before guessing begins."

## 4. Results

Show the recovered-account chart, guessing-speed chart, and account grid.

Message:

"This is the main technical result. Under the same window, SHA-256 allows far more guesses, so more accounts are recovered. bcrypt and Argon2id reduce the attack result by making each guess slower."

"Plain text and SHA-256 can both show 16/16, but they mean different things. Plain text is direct exposure with no guessing. SHA-256 is recovered by offline wordlist cracking because each guess is very cheap."

## 5. Findings

Show evidence-to-recommendation mapping.

Message:

"The final recommendation is layered: improve password policy, never store plaintext, avoid fast password hashes, and use bcrypt or Argon2id with deliberate cost settings."

## Ethical Boundary

"Only synthetic passwords and a local wordlist were used. No real users, systems, or credentials were attacked."
