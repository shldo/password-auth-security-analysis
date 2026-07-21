# Analysis Summary

Generated from `results/analysis_results.json`.

## Experiment Context

- Synthetic users: 10
- Wordlist size: 18
- Attack budget: 2.0 seconds per storage method
- bcrypt rounds: 10
- Argon2id parameters: time cost 3, memory cost 65536 KiB, parallelism 1

## Storage Method Results

| Storage method | Cracked within budget | Guesses/sec | Average verify time | Time to first crack |
|---|---:|---:|---:|---:|
| Plain text | 10/10 | Direct exposure | 0 ms | 0 s |
| Salted SHA-256 | 10/10 | 372,511.19 | 0.00 ms | 0.00 s |
| bcrypt | 4/10 | 19.71 | 50.74 ms | 0.11 s |
| Argon2id | 2/10 | 5.55 | 180.06 ms | 0.37 s |

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
3. Argon2id reduced the cracked accounts to 2/10 under the same demonstration budget by increasing verification cost.
4. The demonstration stops at measured password exposure and cracking results. MFA is discussed qualitatively in the report, not treated as an experimental result.
5. The layered password policy rejected 100% of weak or predictable passwords while accepting 100% of strong long-password examples in the synthetic dataset.

## Interpretation

The experiment supports the main security engineering argument: password complexity is not the main security objective. Password choice, password storage, and offline cracking cost each affect a different part of the database-leak attack chain. MFA and account recovery are report-only analysis topics because they were not implemented or tested in the demonstration.
