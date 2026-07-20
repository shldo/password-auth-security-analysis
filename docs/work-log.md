# Work Log

This work log is intended to show a credible development process for the COMP6841 project. It should be updated during the project rather than written only at the end.

| Date | Time | Work completed | Evidence |
|---|---:|---|---|
| 2026-07-20 | 1.0h | Read the project information and tutor report notes. Narrowed the topic to a password authentication security engineering analysis. | `docs/report-outline.md`, `docs/assessment-traceability.md` |
| 2026-07-20 | 1.0h | Designed the project attack chain and deliverable structure. | `README.md`, `docs/presentation-outline.md` |
| 2026-07-20 | 1.0h | Created synthetic user password dataset and local demonstration wordlist. | `data/sample_passwords.csv`, `data/attack_wordlist.txt` |
| 2026-07-20 | 2.0h | Implemented controlled password storage and offline cracking simulation. | `scripts/generate_results.py`, `results/analysis_results.json` |
| 2026-07-20 | 2.0h | Built first dashboard version around the database-leak attack chain. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Wrote client-facing demo script for the 5-minute presentation. | `docs/demo-script.md` |
| 2026-07-20 | 1.5h | Added source-grounded research notes and formal threat model. | `docs/research-notes.md`, `docs/threat-model.md` |
| 2026-07-20 | 1.0h | Added report-ready result summary generation. | `scripts/export_analysis_summary.py`, `results/analysis_summary.md` |
| 2026-07-20 | 1.0h | Fixed dashboard layout issue and added a start button for the attack-chain demo. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Reworked the password choice screen into password type comparison for clearer presentation logic. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Replaced spaced passphrase examples with no-space long password phrases for more realistic site compatibility. | `data/sample_passwords.csv`, `data/attack_wordlist.txt`, `dashboard/app.js` |

## Planned Time Budget

| Work area | Target time |
|---|---:|
| Background research | 4h |
| Threat model and experiment design | 3h |
| Dataset and wordlist design | 2h |
| Hashing and cracking simulation code | 7h |
| Password policy and MFA risk analysis | 4h |
| Front-end dashboard | 5h |
| Report writing | 3h |
| Slides and presentation practice | 2h |
| Total | 30h |

## Commit Strategy

Use small, stage-based commits:

1. `init project structure and assessment traceability`
2. `add synthetic password dataset and attack wordlist`
3. `implement password storage and cracking simulation`
4. `generate analysis result data`
5. `build dashboard attack-chain view`
6. `add report screenshots and analysis notes`
7. `prepare presentation material`
