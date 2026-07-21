# MFA Scenario Model

This project does not implement a real MFA system such as TOTP, SMS OTP, push approval, or WebAuthn. Instead, it uses a scenario model to show where MFA sits in the authentication attack chain after a password has already been cracked.

## What Is Measured

- Whether passwords are directly exposed or cracked from leaked records.
- How storage method changes offline guessing cost.
- Which synthetic accounts have MFA enabled in the scenario.

## What Is Modeled

The dashboard does not know whether a real MFA challenge would be bypassed. It only models whether the password alone is enough to complete login.

For this project, a model is appropriate because the aim is to compare risk outcomes in a controlled case study, not to build or attack a production login service.

## Inputs

- Cracked accounts from the offline cracking simulation.
- MFA scenario selected in the dashboard:
  - MFA off
  - Current mixed state
  - MFA required

## Rule

```text
cracked password + MFA off = direct password-only account takeover
cracked password + MFA on = second factor required
```

## Outputs

- Cracked passwords
- Direct password-only account takeovers
- Logins that reach a second-factor challenge
- MFA bypass risk left as an explicit limitation

## Scenarios

| Scenario | Meaning | Expected effect |
|---|---|---|
| MFA off | No account has MFA protection | Every cracked password is enough for password-only takeover |
| Current mixed state | Some sample accounts have MFA and some do not | Only accounts without MFA are directly taken over in the model |
| MFA required | Every account has MFA protection | Every cracked-password login reaches a second-factor challenge |

## Limitations

- It treats MFA as binary: on or off.
- It does not distinguish between SMS, TOTP, push, passkeys, or hardware keys.
- It does not simulate phishing-resistant MFA.
- It does not model account recovery bypass.
- It does not model user approval mistakes or MFA fatigue.

These limitations are discussed in the report because real MFA security depends on factor type, recovery process, user behaviour, and phishing resistance.
