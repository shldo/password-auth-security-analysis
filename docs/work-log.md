# Work Log

This work log is intended to show a credible development process for the COMP6841 project. It should be updated during the project rather than written only at the end.

| Date | Time | Work completed | Evidence |
|---|---:|---|---|
| 2026-07-20 | 1.0h | Read the project information and tutor report notes. Narrowed the topic to a password authentication security engineering analysis. | `docs/report-outline.md`, `docs/assessment-traceability.md` |
| 2026-07-20 | 1.0h | Designed the project attack chain and deliverable structure. | `README.md`, `docs/presentation-outline.md` |
| 2026-07-20 | 1.0h | Created synthetic user password dataset and local demonstration wordlist. | `data/sample_passwords.csv`, `data/attack_wordlist.txt` |
| 2026-07-20 | 2.0h | Implemented controlled password storage and offline cracking simulation. | `scripts/generate_results.py`, `results/analysis_results.json` |
| 2026-07-20 | 2.0h | Built first dashboard version around the database-leak attack chain. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Wrote tutor-facing demo script for the 5-minute presentation. | `docs/demo-script.md` |
| 2026-07-20 | 1.5h | Added source-grounded research notes and formal threat model. | `docs/research-notes.md`, `docs/threat-model.md` |
| 2026-07-20 | 1.0h | Added report-ready result summary generation. | `scripts/export_analysis_summary.py`, `results/analysis_summary.md` |
| 2026-07-20 | 1.0h | Fixed dashboard layout issue and added a start button for the attack-chain demo. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Reworked the password choice screen into password type comparison for clearer presentation logic. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Replaced spaced passphrase examples with practical long password phrase examples. | `data/sample_passwords.csv`, `data/attack_wordlist.txt`, `dashboard/app.js` |
| 2026-07-20 | 0.5h | Renamed first and final dashboard stages to assessment-focused wording and simplified visible password-form wording. | `dashboard/index.html`, `dashboard/app.js`, `docs/demo-script.md` |
| 2026-07-20 | 1.0h | Added MFA scenario controls to make login-risk simulation clearer during presentation. | `dashboard/app.js`, `dashboard/style.css`, `docs/demo-script.md` |
| 2026-07-21 | 0.75h | Reframed the dashboard as a tutor-facing case-study assessment and clarified MFA as a risk model. | `dashboard/app.js`, `docs/demo-script.md`, `docs/threat-model.md` |
| 2026-07-21 | 1.0h | Rebuilt the dashboard flow so each page maps one control to one attack-chain stage and one indicator. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js` |
| 2026-07-21 | 0.75h | Removed MFA from the dashboard demonstration and kept it as report-only qualitative analysis. | `dashboard/index.html`, `dashboard/app.js`, `docs/mfa-risk-model.md`, `docs/report-outline.md` |
| 2026-07-21 | 0.75h | Improved dashboard visual evidence with policy decision and cracking outcome matrices. | `dashboard/app.js`, `dashboard/style.css`, `docs/demo-script.md` |
| 2026-07-21 | 1.5h | Rebuilt the dashboard as a tutor-facing presentation console with clearer stage navigation, run controls, and result visualisations. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js`, `docs/demo-script.md` |
| 2026-07-21 | 0.5h | Wrote formal front-end redesign requirements to align the next dashboard iteration with the marking criteria, project topic, and presentation needs. | `docs/frontend-redesign-requirements.md` |
| 2026-07-21 | 1.5h | Rebuilt the dashboard into a cleaner visual presentation with password type gallery, attack-window controls, storage selection, and non-repeating result views. | `dashboard/index.html`, `dashboard/style.css`, `dashboard/app.js`, `docs/demo-script.md`, `docs/presentation-outline.md` |
| 2026-07-21 | 0.75h | Expanded the synthetic password dataset and wordlist, regenerated results, and changed the policy decision matrix to show every account. | `data/sample_passwords.csv`, `data/attack_wordlist.txt`, `results/analysis_results.json`, `dashboard/app.js` |
| 2026-07-21 | 0.75h | Rebalanced the password dataset to 16 synthetic accounts with four examples in each complexity/layered decision outcome class. | `data/sample_passwords.csv`, `data/attack_wordlist.txt`, `dashboard/app.js`, `results/analysis_results.json` |

## Planned Time Budget

| Work area | Target time |
|---|---:|
| Background research | 4h |
| Threat model and experiment design | 3h |
| Dataset and wordlist design | 2h |
| Hashing and cracking simulation code | 7h |
| Password policy and report-only MFA analysis | 4h |
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
