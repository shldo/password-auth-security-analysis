# Raising the Cost of Offline Password Cracking

COMP6841 project deliverable for analysing modern password authentication from a security engineering perspective.

## Project Question

After a password database leak, how do password choice and storage design change what an offline attacker can recover within a fixed attack budget?

This project analyses a controlled offline cracking cost model:

1. A case-study authentication system allows password creation.
2. Those passwords are stored using different storage methods.
3. The password database is leaked.
4. An attacker runs an ordered local wordlist against the leaked records.
5. The result is measured as recovered passwords under the same time budget.

MFA is discussed qualitatively in the report, but it is not part of the dashboard demonstration or measured experiment.

## Deliverables

- A reproducible local experiment in `scripts/`
- Generated evidence data in `results/`
- A tutor-facing front-end presentation console in `dashboard/`
- Report and presentation planning material in `docs/`

## Run

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Generate experiment results:

```powershell
python scripts/build_synthetic_dataset.py
python scripts/generate_results.py
python scripts/export_analysis_summary.py
```

Open the dashboard:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/dashboard/`.

## Assessment Traceability

This repository is structured to support the COMP6841 marking criteria:

- research evidence: see `docs/references.md`
- technical implementation: see `scripts/`
- analysis and findings: see `results/` and `docs/presentation-outline.md`
- presentation evidence: see `dashboard/` and `docs/presentation-outline.md`
- report structure: see `docs/report-outline.md`
