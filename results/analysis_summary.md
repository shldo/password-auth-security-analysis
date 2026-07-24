# Analysis Summary

Generated from `results/analysis_results.json`.

## Experiment Context

- Synthetic users: 64
- Wordlist size: 320
- Attack budget: 2.0 seconds per storage method
- bcrypt rounds: 10
- Argon2id parameters: time cost 3, memory cost 65536 KiB, parallelism 1

## Storage Method Results

| Storage method | Cracked within budget | Guesses/sec | Average verify time | Time to first crack |
|---|---:|---:|---:|---:|
| Plain text | 64/64 | Direct exposure | 0 ms | 0 s |
| Salted SHA-256 | 64/64 | 913,144.22 | 0.00 ms | 0.00 s |
| bcrypt | 5/64 | 20.61 | 48.51 ms | 0.45 s |
| Argon2id | 2/64 | 6.07 | 164.80 ms | 1.49 s |

## Password Policy Results

| Policy | Weak rejection rate | Strong acceptance rate | Weak passwords accepted | Strong passwords rejected |
|---|---:|---:|---:|---:|
| Complexity rule | 50% | 50% | 16 | 16 |
| Length-first rule | 94% | 97% | 2 | 1 |
| Blocklist rule | 88% | 100% | 4 | 0 |
| Layered policy | 100% | 100% | 0 | 0 |

## Report-Ready Findings

1. Plaintext storage is a direct exposure failure rather than a cracking problem.
2. Salted SHA-256 still allowed all 64 synthetic accounts to be cracked within the fixed attack budget because each guess is cheap.
3. Argon2id reduced the cracked accounts to 2/64 under the same demonstration budget by increasing verification cost.
4. The demonstration stops at measured password exposure and cracking results. MFA is discussed qualitatively in the report, not treated as an experimental result.
5. The layered password policy rejected 100% of weak or predictable passwords while accepting 100% of strong long-password examples in the synthetic dataset.

## Interpretation

The experiment supports the main security engineering argument: after a database leak, the objective is to raise offline attack cost. Password choice affects whether a password appears in the candidate list and how early it is guessed. Password storage affects the cost of verifying each candidate. The attack budget makes these controls measurable by comparing how many accounts are recovered under the same constraint. MFA and account recovery are report-only analysis topics because they were not implemented or tested in the demonstration.
