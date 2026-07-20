from __future__ import annotations

import csv
import hashlib
import hmac
import json
import statistics
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import bcrypt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
RESULTS_DIR = ROOT / "results"

BCRYPT_ROUNDS = 10
ARGON2_HASHER = PasswordHasher(
    time_cost=3,
    memory_cost=65_536,
    parallelism=1,
    hash_len=16,
    salt_len=16,
)
ATTACK_BUDGET_SECONDS = 2.0


@dataclass(frozen=True)
class UserPassword:
    username: str
    password: str
    profile: str
    mfa_enabled: bool
    risk_label: str


def read_users() -> list[UserPassword]:
    with (DATA_DIR / "sample_passwords.csv").open(newline="", encoding="utf-8") as handle:
        rows = csv.DictReader(handle)
        return [
            UserPassword(
                username=row["username"],
                password=row["password"],
                profile=row["profile"],
                mfa_enabled=row["mfa_enabled"].lower() == "true",
                risk_label=row["risk_label"],
            )
            for row in rows
        ]


def read_wordlist() -> list[str]:
    return [
        line.strip()
        for line in (DATA_DIR / "attack_wordlist.txt").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]


def deterministic_salt(username: str) -> str:
    return hashlib.sha256(f"demo-salt:{username}".encode("utf-8")).hexdigest()[:16]


def sha256_digest(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def create_records(users: list[UserPassword]) -> dict[str, list[dict]]:
    records: dict[str, list[dict]] = {
        "plaintext": [],
        "sha256": [],
        "bcrypt": [],
        "argon2id": [],
    }

    for user in users:
        salt = deterministic_salt(user.username)
        records["plaintext"].append(
            {
                "username": user.username,
                "stored": user.password,
                "mfa_enabled": user.mfa_enabled,
                "profile": user.profile,
                "risk_label": user.risk_label,
            }
        )
        records["sha256"].append(
            {
                "username": user.username,
                "salt": salt,
                "stored": sha256_digest(user.password, salt),
                "mfa_enabled": user.mfa_enabled,
                "profile": user.profile,
                "risk_label": user.risk_label,
            }
        )
        records["bcrypt"].append(
            {
                "username": user.username,
                "stored": bcrypt.hashpw(
                    user.password.encode("utf-8"),
                    bcrypt.gensalt(rounds=BCRYPT_ROUNDS),
                ).decode("utf-8"),
                "mfa_enabled": user.mfa_enabled,
                "profile": user.profile,
                "risk_label": user.risk_label,
            }
        )
        records["argon2id"].append(
            {
                "username": user.username,
                "stored": ARGON2_HASHER.hash(user.password),
                "mfa_enabled": user.mfa_enabled,
                "profile": user.profile,
                "risk_label": user.risk_label,
            }
        )

    return records


def verify_plaintext(candidate: str, record: dict) -> bool:
    return hmac.compare_digest(candidate, record["stored"])


def verify_sha256(candidate: str, record: dict) -> bool:
    return hmac.compare_digest(sha256_digest(candidate, record["salt"]), record["stored"])


def verify_bcrypt(candidate: str, record: dict) -> bool:
    return bcrypt.checkpw(candidate.encode("utf-8"), record["stored"].encode("utf-8"))


def verify_argon2id(candidate: str, record: dict) -> bool:
    try:
        return ARGON2_HASHER.verify(record["stored"], candidate)
    except VerifyMismatchError:
        return False


VERIFY_FUNCTIONS: dict[str, Callable[[str, dict], bool]] = {
    "plaintext": verify_plaintext,
    "sha256": verify_sha256,
    "bcrypt": verify_bcrypt,
    "argon2id": verify_argon2id,
}


METHOD_DESCRIPTIONS = {
    "plaintext": {
        "label": "Plain text",
        "summary": "Database leak directly exposes the original password.",
        "security_role": "Failure case used as a baseline.",
    },
    "sha256": {
        "label": "Salted SHA-256",
        "summary": "A fast general-purpose hash. Salt helps, but fast verification still helps offline attackers.",
        "security_role": "Shows why hash alone is not enough for password storage.",
    },
    "bcrypt": {
        "label": "bcrypt",
        "summary": "Adaptive password hashing with a cost factor.",
        "security_role": "Raises offline guessing cost after a database leak.",
    },
    "argon2id": {
        "label": "Argon2id",
        "summary": "Modern memory-hard password hashing.",
        "security_role": "Raises CPU and memory cost for offline guessing.",
    },
}


def simulate_attack(method: str, method_records: list[dict], wordlist: list[str]) -> dict:
    if method == "plaintext":
        cracked = [
            {
                "username": record["username"],
                "password": record["stored"],
                "profile": record["profile"],
                "risk_label": record["risk_label"],
                "mfa_enabled": record["mfa_enabled"],
                "attempts_for_user": 0,
                "seconds_for_user": 0,
            }
            for record in method_records
        ]
        takeover_without_mfa = len(cracked)
        takeover_with_mfa = sum(1 for account in cracked if not account["mfa_enabled"])
        return {
            "method": method,
            **METHOD_DESCRIPTIONS[method],
            "attempts": 0,
            "attack_budget_seconds": ATTACK_BUDGET_SECONDS,
            "budget_exhausted": False,
            "total_seconds": 0,
            "time_to_first_crack_seconds": 0,
            "average_verify_ms": 0,
            "median_verify_ms": 0,
            "guesses_per_second": None,
            "cracked_accounts": len(cracked),
            "total_accounts": len(method_records),
            "cracked_rate": 1.0,
            "account_takeover_without_mfa": takeover_without_mfa,
            "account_takeover_with_mfa": takeover_with_mfa,
            "mfa_blocked_takeovers": takeover_without_mfa - takeover_with_mfa,
            "cracked": cracked,
        }

    verify = VERIFY_FUNCTIONS[method]
    cracked: list[dict] = []
    verification_times: list[float] = []
    attempts = 0
    attack_start = time.perf_counter()
    time_to_first_crack = None
    budget_exhausted = False

    for record in method_records:
        if time.perf_counter() - attack_start >= ATTACK_BUDGET_SECONDS:
            budget_exhausted = True
            break

        user_attempt_start = time.perf_counter()
        for candidate_index, candidate in enumerate(wordlist, start=1):
            if time.perf_counter() - attack_start >= ATTACK_BUDGET_SECONDS:
                budget_exhausted = True
                break

            attempts += 1
            check_start = time.perf_counter()
            matched = verify(candidate, record)
            verification_times.append(time.perf_counter() - check_start)

            if matched:
                elapsed = time.perf_counter() - attack_start
                if time_to_first_crack is None:
                    time_to_first_crack = elapsed
                cracked.append(
                    {
                        "username": record["username"],
                        "password": candidate,
                        "profile": record["profile"],
                        "risk_label": record["risk_label"],
                        "mfa_enabled": record["mfa_enabled"],
                        "attempts_for_user": candidate_index,
                        "seconds_for_user": round(time.perf_counter() - user_attempt_start, 4),
                    }
                )
                break

    total_seconds = time.perf_counter() - attack_start
    cracked_count = len(cracked)
    takeover_without_mfa = cracked_count
    takeover_with_mfa = sum(1 for account in cracked if not account["mfa_enabled"])

    average_verify_ms = statistics.mean(verification_times) * 1000 if verification_times else 0
    median_verify_ms = statistics.median(verification_times) * 1000 if verification_times else 0
    guesses_per_second = attempts / total_seconds if total_seconds else 0

    return {
        "method": method,
        **METHOD_DESCRIPTIONS[method],
        "attempts": attempts,
        "attack_budget_seconds": ATTACK_BUDGET_SECONDS,
        "budget_exhausted": budget_exhausted,
        "total_seconds": round(total_seconds, 4),
        "time_to_first_crack_seconds": round(time_to_first_crack or 0, 4),
        "average_verify_ms": round(average_verify_ms, 4),
        "median_verify_ms": round(median_verify_ms, 4),
        "guesses_per_second": round(guesses_per_second, 2),
        "cracked_accounts": cracked_count,
        "total_accounts": len(method_records),
        "cracked_rate": round(cracked_count / len(method_records), 3),
        "account_takeover_without_mfa": takeover_without_mfa,
        "account_takeover_with_mfa": takeover_with_mfa,
        "mfa_blocked_takeovers": takeover_without_mfa - takeover_with_mfa,
        "cracked": cracked,
    }


COMMON_PASSWORD_BLOCKLIST = {
    "password",
    "password123",
    "password123!",
    "qwerty",
    "qwerty2024!",
    "letmein",
    "letmein!",
    "admin",
    "welcome",
    "summer2026!",
    "unsw2026!",
    "sydney2026!",
}

CONTEXT_TERMS = {"unsw", "sydney", "summer", "winter", "2026"}


def has_upper(password: str) -> bool:
    return any(char.isupper() for char in password)


def has_lower(password: str) -> bool:
    return any(char.islower() for char in password)


def has_digit(password: str) -> bool:
    return any(char.isdigit() for char in password)


def has_symbol(password: str) -> bool:
    return any(not char.isalnum() and not char.isspace() for char in password)


def is_common_or_contextual(password: str) -> bool:
    lowered = password.lower()
    if lowered in COMMON_PASSWORD_BLOCKLIST:
        return True
    return any(term in lowered for term in CONTEXT_TERMS) and has_digit(password)


POLICY_DEFINITIONS: dict[str, dict] = {
    "composition": {
        "label": "Complexity rule",
        "description": "At least 8 characters with uppercase, lowercase, digit, and symbol.",
    },
    "length": {
        "label": "Length-first rule",
        "description": "At least 14 characters. Allows long no-space phrases.",
    },
    "blocklist": {
        "label": "Blocklist rule",
        "description": "At least 8 characters and not common, breached, or context-specific.",
    },
    "layered": {
        "label": "Layered policy",
        "description": "At least 12 characters, blocklisted passwords rejected, long no-space phrases allowed.",
    },
}


def policy_accepts(policy: str, password: str) -> tuple[bool, str]:
    if policy == "composition":
        checks = [
            len(password) >= 8,
            has_upper(password),
            has_lower(password),
            has_digit(password),
            has_symbol(password),
        ]
        return all(checks), "requires length, uppercase, lowercase, digit, and symbol"

    if policy == "length":
        return len(password) >= 14, "requires at least 14 characters"

    if policy == "blocklist":
        if len(password) < 8:
            return False, "too short"
        if is_common_or_contextual(password):
            return False, "common, breached, or context-specific pattern"
        return True, "passes minimum length and blocklist"

    if policy == "layered":
        if len(password) < 12:
            return False, "too short for layered policy"
        if is_common_or_contextual(password):
            return False, "common, breached, or context-specific pattern"
        return True, "long enough and not blocklisted"

    raise ValueError(f"Unknown policy: {policy}")


def evaluate_policies(users: list[UserPassword]) -> list[dict]:
    policy_results = []
    weak_users = [user for user in users if user.risk_label != "strong_passphrase"]
    strong_users = [user for user in users if user.risk_label == "strong_passphrase"]

    for policy, definition in POLICY_DEFINITIONS.items():
        decisions = []
        for user in users:
            accepted, reason = policy_accepts(policy, user.password)
            decisions.append(
                {
                    "username": user.username,
                    "password": user.password,
                    "accepted": accepted,
                    "reason": reason,
                    "profile": user.profile,
                    "risk_label": user.risk_label,
                }
            )

        rejected_weak = sum(
            1
            for decision in decisions
            if decision["risk_label"] != "strong_passphrase" and not decision["accepted"]
        )
        accepted_strong = sum(
            1
            for decision in decisions
            if decision["risk_label"] == "strong_passphrase" and decision["accepted"]
        )
        false_accepts = sum(
            1
            for decision in decisions
            if decision["risk_label"] != "strong_passphrase" and decision["accepted"]
        )
        false_rejects = sum(
            1
            for decision in decisions
            if decision["risk_label"] == "strong_passphrase" and not decision["accepted"]
        )

        policy_results.append(
            {
                "policy": policy,
                **definition,
                "weak_password_rejection_rate": round(rejected_weak / len(weak_users), 3),
                "strong_password_acceptance_rate": round(accepted_strong / len(strong_users), 3),
                "false_accepts": false_accepts,
                "false_rejects": false_rejects,
                "decisions": decisions,
            }
        )

    return policy_results


def build_attack_chain_summary(storage_results: list[dict], policy_results: list[dict]) -> dict:
    sha256 = next(result for result in storage_results if result["method"] == "sha256")
    argon2id = next(result for result in storage_results if result["method"] == "argon2id")
    layered_policy = next(result for result in policy_results if result["policy"] == "layered")

    return {
        "client_baseline": {
            "password_policy": "Complexity rule: uppercase, lowercase, number, symbol",
            "storage": "Salted SHA-256",
            "mfa": "Optional, not required for all users",
            "breached_password_check": "Not present",
        },
        "main_finding": "Password complexity does not protect the whole authentication chain after a database leak.",
        "risk_reduction_story": [
            "Blocklists and long-password-friendly rules improve password choice before storage.",
            "bcrypt or Argon2id increases attacker cost during offline cracking.",
            "MFA reduces account takeover after a password is cracked.",
            "Account recovery must be protected because it can bypass the password and MFA path.",
        ],
        "headline_metrics": {
            "sha256_guesses_per_second": sha256["guesses_per_second"],
            "argon2id_guesses_per_second": argon2id["guesses_per_second"],
            "layered_policy_weak_rejection_rate": layered_policy["weak_password_rejection_rate"],
            "mfa_blocked_takeovers_under_sha256": sha256["mfa_blocked_takeovers"],
        },
    }


def preview_leaked_records(records: dict[str, list[dict]]) -> dict[str, list[dict]]:
    previews: dict[str, list[dict]] = {}

    for method, method_records in records.items():
        previews[method] = []
        for record in method_records[:5]:
            stored_value = record["stored"]
            if method != "plaintext":
                stored_value = f"{stored_value[:34]}..."
            previews[method].append(
                {
                    "username": record["username"],
                    "leaked_value": stored_value,
                    "mfa_enabled": record["mfa_enabled"],
                    "profile": record["profile"],
                }
            )

    return previews


def main() -> None:
    RESULTS_DIR.mkdir(exist_ok=True)
    users = read_users()
    wordlist = read_wordlist()
    records = create_records(users)
    storage_results = [
        simulate_attack(method, records[method], wordlist)
        for method in ["plaintext", "sha256", "bcrypt", "argon2id"]
    ]
    policy_results = evaluate_policies(users)

    result = {
        "project": "Password Authentication Security Analysis",
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "experiment_context": {
            "purpose": "Controlled demonstration of database-leak risk using synthetic users and passwords.",
            "ethical_boundary": "No real systems, accounts, or credentials are attacked.",
            "wordlist_size": len(wordlist),
            "user_count": len(users),
            "attack_budget_seconds_per_method": ATTACK_BUDGET_SECONDS,
            "bcrypt_rounds": BCRYPT_ROUNDS,
            "argon2id_parameters": {
                "time_cost": ARGON2_HASHER.time_cost,
                "memory_cost_kib": ARGON2_HASHER.memory_cost,
                "parallelism": ARGON2_HASHER.parallelism,
            },
        },
        "users": [
            {
                "username": user.username,
                "password": user.password,
                "profile": user.profile,
                "mfa_enabled": user.mfa_enabled,
                "risk_label": user.risk_label,
            }
            for user in users
        ],
        "leaked_record_previews": preview_leaked_records(records),
        "storage_results": storage_results,
        "policy_results": policy_results,
        "attack_chain_summary": build_attack_chain_summary(storage_results, policy_results),
    }

    output_path = RESULTS_DIR / "analysis_results.json"
    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

    print(f"Wrote {output_path.relative_to(ROOT)}")
    for storage_result in storage_results:
        speed = (
            "direct exposure"
            if storage_result["guesses_per_second"] is None
            else f"{storage_result['guesses_per_second']} guesses/sec"
        )
        print(
            f"{storage_result['label']}: "
            f"{storage_result['cracked_accounts']}/{storage_result['total_accounts']} cracked, "
            f"{speed}"
        )


if __name__ == "__main__":
    main()
