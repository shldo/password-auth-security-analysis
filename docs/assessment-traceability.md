# Assessment Traceability

This file maps project work to the COMP6841 project expectations and Tom's report notes.

## Evidence of Work

- Code: `scripts/generate_results.py`
- Data: `data/sample_passwords.csv`, `data/attack_wordlist.txt`
- Results: `results/analysis_results.json`
- Demonstration: `dashboard/index.html`
- Report plan: `docs/report-outline.md`
- Presentation plan: `docs/presentation-outline.md`

## Analysis and Critical Thinking

- The project does not treat password complexity as the only control.
- It evaluates the authentication chain after a database leak.
- It separates password policy, password storage, cracking cost, and MFA into measurable stages.

## Technical Depth

- Implements password storage comparisons.
- Uses salted SHA-256, bcrypt, and Argon2id.
- Runs a controlled offline wordlist attack simulation.
- Calculates account takeover risk with and without MFA.

## Professional and Ethical Boundaries

- Uses only fake users and fake passwords.
- Does not attack a real system.
- Does not collect, store, or test real credentials.
- Frames cracking as a controlled security engineering experiment.

## Report Length Strategy

The report can be shorter than the typical 5-15 page guide if it clearly provides:

- enough technical evidence
- clear analysis
- screenshots and results
- reflection and limitations
- references

The target report length is about 4-6 pages of main text, with screenshots and code evidence in appendices if needed.
