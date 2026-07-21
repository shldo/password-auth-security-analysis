# MFA Risk Model

This project does not implement a real MFA system such as TOTP, SMS OTP, push approval, or WebAuthn. Instead, it uses a simple deterministic risk model to show how MFA changes account takeover after a password has already been cracked.

## Why a Model Is Enough

The project question is about authentication risk after a database leak. The technical experiment already measures whether passwords are exposed or cracked. MFA belongs to the next stage: whether a known password is enough to complete login.

For this project, a model is appropriate because the aim is to compare risk outcomes, not to build a production login service.

## Inputs

- Cracked accounts from the offline cracking simulation.
- MFA scenario selected in the dashboard:
  - MFA off
  - Current mixed state
  - MFA required

## Rule

```text
cracked password + MFA off = account takeover
cracked password + MFA on = blocked or challenged
```

## Outputs

- Cracked passwords
- Account takeovers
- MFA blocked/challenged logins

## Scenarios

| Scenario | Meaning | Expected effect |
|---|---|---|
| MFA off | No account has MFA protection | Every cracked password becomes account takeover |
| Current mixed state | Some sample accounts have MFA and some do not | Only accounts without MFA are directly taken over |
| MFA required | Every account has MFA protection | Cracked passwords do not directly become account takeover |

## Limitations

- It treats MFA as binary: on or off.
- It does not distinguish between SMS, TOTP, push, passkeys, or hardware keys.
- It does not simulate phishing-resistant MFA.
- It does not model account recovery bypass.
- It does not model user approval mistakes or MFA fatigue.

These limitations are discussed in the report because real MFA security depends on factor type, recovery process, user behaviour, and phishing resistance.
