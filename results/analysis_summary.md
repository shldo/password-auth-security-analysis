# Analysis Summary

Generated from `results/analysis_results.json`.

## Experiment Context

- Synthetic users: 10
- Wordlist size: 18
- Attack budget: 2.0 seconds per storage method
- bcrypt rounds: 10
- Argon2id parameters: time cost 3, memory cost 65536 KiB, parallelism 1

## Storage Method Results

| Storage method | Cracked within budget | Guesses/sec | Average verify time | Password-only takeover if MFA off | Password-only takeover in current MFA scenario | Second-factor challenges in current MFA scenario |
|---|---:|---:|---:|---:|---:|---:|
| Plain text | 10/10 | Direct exposure | 0 ms | 10 | 5 | 5 |
| Salted SHA-256 | 10/10 | 454,011.80 | 0.00 ms | 10 | 5 | 5 |
| bcrypt | 4/10 | 19.45 | 51.41 ms | 4 | 2 | 2 |
| Argon2id | 1/10 | 5.28 | 189.38 ms | 1 | 0 | 1 |

## Password Policy Results

| Policy | Weak rejection rate | Strong acceptance rate | Weak passwords accepted | Strong passwords rejected |
|---|---:|---:|---:|---:|
| Complexity rule | 43% | 0% | 4 | 3 |
| Length-first rule | 86% | 100% | 1 | 0 |
| Blocklist rule | 86% | 100% | 1 | 0 |
| Layered policy | 100% | 100% | 0 | 0 |

## Report-Ready Findings

1. Plaintext storage is a direct exposure failure rather than a cracking problem.
2. Salted SHA-256 still allowed all 10 synthetic accounts to be cracked within the fixed attack budget because each guess is cheap.
3. Argon2id reduced the cracked accounts to 1/10 under the same demonstration budget by increasing verification cost.
4. MFA is modeled after cracking, not measured as a real implementation: under the SHA-256 path, 5 cracked-password logins would require a second factor in the current scenario, while bypass risk remains outside the experiment.
5. The layered password policy rejected 100% of weak or predictable passwords while accepting 100% of strong long-password examples in the synthetic dataset.

## Interpretation

The experiment supports the main security engineering argument: password complexity is not the main security objective. Password choice, password storage, offline cracking cost, MFA, and account recovery each affect a different part of the attack chain.
