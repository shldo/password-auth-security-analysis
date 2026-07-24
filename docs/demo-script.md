# Dashboard Demo Script

Use this as the 5-minute tutor presentation story. Keep the speech short and let the dashboard visuals carry the evidence.

## Opening

"My project is about raising the cost of offline password cracking after a database leak. I built a controlled lab to show how password choice, wordlist priority, and storage method change what an attacker can recover within the same time budget."

Click **Run demo** if you want the dashboard to move through the four demo views automatically.

## 1. Overview

Show the attack chain:

Password guessability -> leaked records -> cost per guess -> recovered passwords within budget.

Message:

"This is not an attack on a real system. The dataset is synthetic, the wordlist is local, and every method is compared under the same attack budget."

## 2. Password Set

Show the password gallery and policy matrix.

Message:

"This page explains the input to the attack model. Some passwords are cheap candidates because they are common or patterned. Others are stronger because they are less likely to appear early in the wordlist. The policy matrix shows which rules reduce cheap guesses before storage even matters."

## 3. Attack Budget

Choose the attack budget and storage method.

Message:

"Here I choose how much time the offline attacker gets and what storage method was leaked. The budget is important because security engineering is not about proving cracking is impossible; it is about making cracking too expensive under realistic constraints."

## 4. Results

Show the recovered-account chart, guessing-speed chart, and account grid.

Message:

"This is the main technical result. Under the same budget, SHA-256 allows far more guesses, so more accounts are recovered. bcrypt and Argon2id reduce the attack result by making each guess slower."

"Plain text and SHA-256 can both show 64/64, but they mean different things. Plain text is direct exposure with no guessing. SHA-256 is recovered by offline wordlist cracking because each guess is very cheap."

## PPT Findings Slide

Use the final presentation slide for recommendations:

"The final recommendation is cost-based: block cheap candidate passwords, never store plaintext, avoid fast password hashes, and tune bcrypt or Argon2id so offline guessing consumes the attacker's budget."

## Ethical Boundary

"Only synthetic passwords and a local wordlist were used. No real users, systems, or credentials were attacked."
