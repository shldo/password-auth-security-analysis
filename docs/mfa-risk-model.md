# MFA Report-Only Analysis

This project does not implement a real MFA system such as TOTP, SMS OTP, push approval, or WebAuthn. MFA is not part of the dashboard demonstration or measured experiment. It is included in the report as a qualitative security engineering discussion.

## What the Project Measures

- Whether passwords are directly exposed or cracked from leaked records.
- How storage method changes offline guessing cost.

## Why MFA Is Still Discussed

MFA belongs after the measured cracking stage. If an attacker learns a password, the next security question is whether the service accepts password-only login or requires another factor. This project does not test that stage, but it is still relevant to the final security recommendation.

Keeping MFA out of the demonstration makes the evidence boundary clearer: password cracking is measured; MFA is analysed from external guidance and listed as future work or a follow-up control.

## Report Position

- Dashboard scope: password policy, password storage, offline cracking cost.
- Report-only analysis: MFA as a later login-stage control.
- Claim boundary: the project does not prove MFA effectiveness or bypass resistance.

## Limitations

- It does not implement a login system.
- It does not run MFA enrollment or verification.
- It does not distinguish between SMS, TOTP, push, passkeys, or hardware keys.
- It does not simulate phishing-resistant MFA.
- It does not model account recovery bypass.
- It does not model user approval mistakes or MFA fatigue.

These limitations are discussed in the report because real MFA security depends on factor type, recovery process, user behaviour, and phishing resistance.
