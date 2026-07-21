# Password Authentication Security Analysis

COMP6841 project deliverable for analysing modern password authentication from a security engineering perspective.

## Project Question

Is password security mainly about password complexity, or does the whole authentication design matter more?

This project analyses a controlled database-leak attack chain:

1. A case-study authentication system allows password creation.
2. Those passwords are stored using different storage methods.
3. The password database is leaked.
4. An attacker runs an offline wordlist attack against the leaked records.
5. The final recommendation is evaluated as a layered authentication design.

MFA is discussed qualitatively in the report, but it is not part of the dashboard demonstration or measured experiment.

## Deliverables

- A reproducible local experiment in `scripts/`
- Generated evidence data in `results/`
- A front-end dashboard in `dashboard/`
- Report and presentation planning material in `docs/`

## Run

Install dependencies:

```powershell
python -m pip install -r requirements.txt
```

Generate experiment results:

```powershell
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
- analysis and findings: see `results/` and `dashboard/`
- presentation evidence: see `dashboard/` and `docs/presentation-outline.md`
- report structure: see `docs/report-outline.md`
