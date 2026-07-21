# Analysis Summary

Generated from `results/analysis_results.json`.

## Experiment Context

- Synthetic users: 24
- Wordlist size: 48
- Attack budget: 2.0 seconds per storage method
- bcrypt rounds: 10
- Argon2id parameters: time cost 3, memory cost 65536 KiB, parallelism 1

## Storage Method Results

| Storage method | Cracked within budget | Guesses/sec | Average verify time | Time to first crack |
|---|---:|---:|---:|---:|
| Plain text | 24/24 | Direct exposure | 0 ms | 0 s |
| Salted SHA-256 | 24/24 | 404,757.85 | 0.00 ms | 0.00 s |
| bcrypt | 4/24 | 19.50 | 51.28 ms | 0.11 s |
| Argon2id | 1/24 | 5.44 | 183.89 ms | 0.39 s |

## Password Policy Results

| Policy | Weak rejection rate | Strong acceptance rate | Weak passwords accepted | Strong passwords rejected |
|---|---:|---:|---:|---:|
| Complexity rule | 19% | 0% | 13 | 8 |
| Length-first rule | 81% | 100% | 3 | 0 |
| Blocklist rule | 94% | 100% | 1 | 0 |
| Layered policy | 100% | 100% | 0 | 0 |

## Report-Ready Findings

1. Plaintext storage is a direct exposure failure rather than a cracking problem.
2. Salted SHA-256 still allowed all 24 synthetic accounts to be cracked within the fixed attack budget because each guess is cheap.
3. Argon2id reduced the cracked accounts to 1/24 under the same demonstration budget by increasing verification cost.
4. The demonstration stops at measured password exposure and cracking results. MFA is discussed qualitatively in the report, not treated as an experimental result.
5. The layered password policy rejected 100% of weak or predictable passwords while accepting 100% of strong long-password examples in the synthetic dataset.

## Interpretation

The experiment supports the main security engineering argument: password complexity is not the main security objective. Password choice, password storage, and offline cracking cost each affect a different part of the database-leak attack chain. MFA and account recovery are report-only analysis topics because they were not implemented or tested in the demonstration.
