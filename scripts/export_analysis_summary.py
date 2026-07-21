from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESULTS_PATH = ROOT / "results" / "analysis_results.json"
SUMMARY_PATH = ROOT / "results" / "analysis_summary.md"


def fmt_number(value: float | int | None, suffix: str = "") -> str:
    if value is None:
        return "Direct exposure"
    if isinstance(value, int):
        return f"{value}{suffix}"
    return f"{value:,.2f}{suffix}"


def main() -> None:
    data = json.loads(RESULTS_PATH.read_text(encoding="utf-8"))

    storage_rows = []
    for result in data["storage_results"]:
        storage_rows.append(
            "| {label} | {cracked}/{total} | {gps} | {verify} | {first_crack} |".format(
                label=result["label"],
                cracked=result["cracked_accounts"],
                total=result["total_accounts"],
                gps=fmt_number(result["guesses_per_second"]),
                verify=fmt_number(result["average_verify_ms"], " ms"),
                first_crack=fmt_number(result["time_to_first_crack_seconds"], " s"),
            )
        )

    policy_rows = []
    for result in data["policy_results"]:
        policy_rows.append(
            "| {label} | {weak}% | {strong}% | {false_accepts} | {false_rejects} |".format(
                label=result["label"],
                weak=round(result["weak_password_rejection_rate"] * 100),
                strong=round(result["strong_password_acceptance_rate"] * 100),
                false_accepts=result["false_accepts"],
                false_rejects=result["false_rejects"],
            )
        )

    sha256 = next(item for item in data["storage_results"] if item["method"] == "sha256")
    argon2id = next(item for item in data["storage_results"] if item["method"] == "argon2id")
    layered = next(item for item in data["policy_results"] if item["policy"] == "layered")

    summary = f"""# Analysis Summary

Generated from `results/analysis_results.json`.

## Experiment Context

- Synthetic users: {data["experiment_context"]["user_count"]}
- Wordlist size: {data["experiment_context"]["wordlist_size"]}
- Attack budget: {data["experiment_context"]["attack_budget_seconds_per_method"]} seconds per storage method
- bcrypt rounds: {data["experiment_context"]["bcrypt_rounds"]}
- Argon2id parameters: time cost {data["experiment_context"]["argon2id_parameters"]["time_cost"]}, memory cost {data["experiment_context"]["argon2id_parameters"]["memory_cost_kib"]} KiB, parallelism {data["experiment_context"]["argon2id_parameters"]["parallelism"]}

## Storage Method Results

| Storage method | Cracked within budget | Guesses/sec | Average verify time | Time to first crack |
|---|---:|---:|---:|---:|
{chr(10).join(storage_rows)}

## Password Policy Results

| Policy | Weak rejection rate | Strong acceptance rate | Weak passwords accepted | Strong passwords rejected |
|---|---:|---:|---:|---:|
{chr(10).join(policy_rows)}

## Report-Ready Findings

1. Plaintext storage is a direct exposure failure rather than a cracking problem.
2. Salted SHA-256 still allowed all {sha256["total_accounts"]} synthetic accounts to be cracked within the fixed attack budget because each guess is cheap.
3. Argon2id reduced the cracked accounts to {argon2id["cracked_accounts"]}/{argon2id["total_accounts"]} under the same demonstration budget by increasing verification cost.
4. The demonstration stops at measured password exposure and cracking results. MFA is discussed qualitatively in the report, not treated as an experimental result.
5. The layered password policy rejected {round(layered["weak_password_rejection_rate"] * 100)}% of weak or predictable passwords while accepting {round(layered["strong_password_acceptance_rate"] * 100)}% of strong long-password examples in the synthetic dataset.

## Interpretation

The experiment supports the main security engineering argument: password complexity is not the main security objective. Password choice, password storage, and offline cracking cost each affect a different part of the database-leak attack chain. MFA and account recovery are report-only analysis topics because they were not implemented or tested in the demonstration.
"""

    SUMMARY_PATH.write_text(summary, encoding="utf-8")
    print(f"Wrote {SUMMARY_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
