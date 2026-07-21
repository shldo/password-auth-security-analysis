# Threat Model

## Case Study Scenario

The target is a fictional small web service with password-based authentication. The system appears reasonably secure because users must create complex-looking passwords, but the main risk being studied is what happens after its password database leaks.

Current configuration:

- Password policy: at least 8 characters, uppercase, lowercase, number, and symbol.
- Password storage: salted SHA-256.
- Breached-password check: not implemented.

## Assets

- User accounts.
- Password database records.
- Password exposure after database leakage.
- Account recovery and MFA are report-only follow-up analysis topics.
- User trust and service reputation.

## Attacker Model

The attacker:

- Has obtained a leaked copy of the password database.
- Can run offline guesses against password records.
- Has access to a candidate wordlist.
- Has a limited time budget in the demonstration, so storage cost changes how many guesses are feasible.

The attacker does not:

- Attack a real system in this project.
- Use real user credentials.
- Exploit browser, server, or network vulnerabilities outside the authentication flow.
- Run phishing against real users.

## Attack Chain

```mermaid
flowchart TD
    A["Case-study authentication design"] --> B["Password forms create different guessability"]
    B --> C["Password policy accepts or rejects cheap candidates"]
    C --> D["Password stored with a selected method"]
    D --> E["Database leak"]
    E --> F["Attacker obtains stored password records"]
    F --> G["Ordered wordlist guessing"]
    G --> H["Each guess has a verification cost"]
    H --> I{"Recovered within attack budget?"}
    I -->|No| J["Password not exposed in the experiment"]
    I -->|Yes| K["Password exposed to attacker"]
    J --> L["Final assessment"]
    K --> L
    I --> K["Final assessment"]
    J --> K
```

## Control Mapping

| Attack stage | Main risk | Control evaluated in this project | Metric |
|---|---|---|---|
| Password creation | Users choose predictable passwords | Complexity rule vs length/blocklist/layered policy | Weak-password rejection rate |
| Wordlist attack | Some passwords are covered earlier than others | Ordered local candidate list | Candidate rank and recovered accounts |
| Password storage | Leaked database exposes or enables cracking | Plaintext vs SHA-256 vs bcrypt vs Argon2id | Cracked accounts under time budget |
| Offline cracking | Attacker can test guesses cheaply | Slow/adaptive password hashing | Guesses per second, average verify time |
| Report-only follow-up | Known password may be used in later login attacks | MFA and account recovery analysis | Qualitative residual risk |

## Ethical Scope

This project uses synthetic users, synthetic passwords, and a local wordlist. It is a defensive demonstration designed to support security engineering analysis. No real service is attacked, and no real credentials are collected, tested, or stored.

## Assumptions and Limitations

- The wordlist is intentionally small so the demonstration is safe and understandable.
- The exact timing results depend on the machine running the experiment.
- The synthetic password set is designed to illustrate categories, not to represent all user behaviour.
- The dashboard does not implement or model MFA. MFA is discussed qualitatively in the report because real MFA strength depends on factor type, recovery process, user behaviour, and phishing resistance.
- The project does not evaluate session management, rate limiting, bot detection, or passkeys in depth.
