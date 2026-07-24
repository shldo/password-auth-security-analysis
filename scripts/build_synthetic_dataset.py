from __future__ import annotations

import csv
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
PASSWORDS_PATH = DATA_DIR / "sample_passwords.csv"
WORDLIST_PATH = DATA_DIR / "attack_wordlist.txt"
WORDLIST_TARGET_SIZE = 320


SYNTHETIC_USERS = [
    ("alice", "RiverMaple73!", "Strong complex password", "strong_passphrase"),
    ("ben", "Password123!", "Complex but common", "weak_common"),
    ("chen", "RiverLanternMuseumOrbit", "Long joined phrase", "strong_passphrase"),
    ("diya", "qwerty2024!", "Common base with year", "weak_common"),
    ("eli", "VioletCoffee29#", "Strong complex password", "strong_passphrase"),
    ("fay", "Summer2026!", "Season and year pattern", "predictable_pattern"),
    ("gio", "GreenOrbitMapleSun", "Long joined phrase", "strong_passphrase"),
    ("hannah", "letmein!", "Very common password", "weak_common"),
    ("ian", "HarborSignal58?", "Strong complex password", "strong_passphrase"),
    ("jin", "UNSWCyber2026!", "Course context pattern", "predictable_pattern"),
    ("kai", "StoneRiverCloudNine", "Long joined phrase", "strong_passphrase"),
    ("lina", "UNSW2026!", "Context-specific pattern", "predictable_pattern"),
    ("mika", "MarbleOrbit41$", "Strong complex password", "strong_passphrase"),
    ("noah", "P@ssw0rd2026", "Transformed common word", "weak_common"),
    ("olivia", "CoffeeBlueTrain59", "Joined words with number", "strong_passphrase"),
    ("peter", "dragon2026", "Dictionary word with year", "weak_common"),
    ("quinn", "CedarPlanet82@", "Strong complex password", "strong_passphrase"),
    ("riley", "Welcome2026!", "Welcome pattern with year", "weak_common"),
    ("sara", "SilverGardenCloudTrail", "Long joined phrase", "strong_passphrase"),
    ("toby", "admin2026", "Admin word with year", "weak_common"),
    ("uma", "CopperSignal47%", "Strong complex password", "strong_passphrase"),
    ("victor", "Winter2026!", "Season and year pattern", "predictable_pattern"),
    ("wendy", "ForestCopperSignalBridge", "Long joined phrase", "strong_passphrase"),
    ("xavier", "football2026", "Common interest with year", "weak_common"),
    ("yara", "QuartzRiver64&", "Strong complex password", "strong_passphrase"),
    ("zoe", "Sydney2026!", "Location and year pattern", "predictable_pattern"),
    ("aaron", "MapleStoneLantern", "Long joined phrase", "strong_passphrase"),
    ("bella", "music2026", "Common word with year", "weak_common"),
    ("carlos", "NimbusHarbor91*", "Strong complex password", "strong_passphrase"),
    ("dana", "Canberra2026!", "Location and year pattern", "predictable_pattern"),
    ("eric", "LanternCoffeeMuseum", "Long joined phrase", "strong_passphrase"),
    ("frida", "abc12345", "Simple sequence", "weak_common"),
    ("george", "AmberRocket36?", "Strong complex password", "strong_passphrase"),
    ("hazel", "Project2026!", "Work context pattern", "predictable_pattern"),
    ("irene", "CobaltGardenRiverStone", "Long joined phrase", "strong_passphrase"),
    ("jack", "password2026", "Password word with year", "weak_common"),
    ("kira", "VelvetOrbit53#", "Strong complex password", "strong_passphrase"),
    ("leo", "Cyber2026!", "Topic and year pattern", "predictable_pattern"),
    ("maya", "PaperMoonSignalHarbor", "Long joined phrase", "strong_passphrase"),
    ("nate", "welcome1", "Common welcome variant", "weak_common"),
    ("opal", "SaffronBeacon28$", "Strong complex password", "strong_passphrase"),
    ("paul", "Comp6841!", "Course code pattern", "predictable_pattern"),
    ("rosa", "BlueCometPaperMoon", "Long joined phrase", "strong_passphrase"),
    ("sam", "trustno1", "Common phrase variant", "weak_common"),
    ("tara", "OrchidVector75!", "Strong complex password", "strong_passphrase"),
    ("ugo", "Tutor2026!", "Role and year pattern", "predictable_pattern"),
    ("vera", "GoldenSignalRiverCloud", "Long joined phrase", "strong_passphrase"),
    ("will", "iloveyou2026", "Common phrase with year", "weak_common"),
    ("xena", "LunarBridge49%", "Strong complex password", "strong_passphrase"),
    ("yusuf", "Exam2026!", "Assessment context pattern", "predictable_pattern"),
    ("zara", "MuseumOrbitCoffeeRiver", "Long joined phrase", "strong_passphrase"),
    ("abby", "login2026", "Login word with year", "weak_common"),
    ("bruno", "ScarletHarbor62?", "Strong complex password", "strong_passphrase"),
    ("claire", "Assignment2026!", "Assessment context pattern", "predictable_pattern"),
    ("derek", "CloudStoneRiverGarden", "Long joined phrase", "strong_passphrase"),
    ("emily", "qazwsx2026", "Keyboard pattern with year", "weak_common"),
    ("felix", "IvorySignal84@", "Strong complex password", "strong_passphrase"),
    ("grace", "Security2026!", "Topic and year pattern", "predictable_pattern"),
    ("henry", "HarborLanternStoneRiver", "Long joined phrase", "strong_passphrase"),
    ("isla", "starwars2026", "Popular phrase with year", "weak_common"),
    ("jules", "TopazVector31#", "Strong complex password", "strong_passphrase"),
    ("kevin", "Password2026!", "Password word with year", "weak_common"),
    ("laura", "OrbitGardenCoffeeTrail", "Long joined phrase", "strong_passphrase"),
    ("miles", "asdf2026", "Keyboard pattern with year", "weak_common"),
]


PINNED_WORDLIST_PREFIX = [
    "password",
    "Password123!",
    "qwerty",
    "qwerty2024!",
    "letmein",
    "letmein!",
    "admin",
    "welcome",
    "RiverMaple73!",
    "VioletCoffee29#",
    "HarborSignal58?",
    "MarbleOrbit41$",
    "Summer2026!",
    "UNSWCyber2026!",
    "P@ssw0rd2026",
    "RiverLanternMuseumOrbit",
    "GreenOrbitMapleSun",
    "StoneRiverCloudNine",
    "CoffeeBlueTrain59",
    "UNSW2026!",
    "dragon2026",
]


CONTEXT_CANDIDATES = [
    "Winter2026!",
    "Sydney2026!",
    "Welcome2026!",
    "SydneyHarbour2026!",
    "Admin2026!",
    "Iloveyou2026!",
    "Canberra2026!",
    "Project2026!",
    "Cyber2026!",
    "Comp6841!",
    "Tutor2026!",
    "Exam2026!",
    "Assignment2026!",
    "Security2026!",
    "Password2026!",
    "welcome1",
    "trustno1",
    "abc12345",
    "admin2026",
    "football2026",
    "music2026",
    "password2026",
    "login2026",
    "qazwsx2026",
    "starwars2026",
    "asdf2026",
    "Tr0ub4dor&3",
    "AvocadoToast2026!",
    "P@55w0rd!",
]


def unique_in_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    output = []
    for value in values:
        if value not in seen:
            seen.add(value)
            output.append(value)
    return output


def build_wordlist() -> list[str]:
    strong_complex = [row[1] for row in SYNTHETIC_USERS if row[2] == "Strong complex password"]
    long_phrases = [row[1] for row in SYNTHETIC_USERS if row[2] in {"Long joined phrase", "Joined words with number"}]
    predictable = [
        row[1]
        for row in SYNTHETIC_USERS
        if row[3] != "strong_passphrase" and row[1] not in PINNED_WORDLIST_PREFIX
    ]

    filler = []
    roots = ["River", "Coffee", "Signal", "Orbit", "Cloud", "Harbor", "Lantern", "Garden"]
    suffixes = ["2024", "2025", "2026", "27", "42", "58", "73", "91"]
    symbols = ["!", "@", "#", "$", "%", "?"]
    for root in roots:
        for suffix in suffixes:
            filler.append(f"{root}{suffix}!")
            filler.append(f"{root}Maple{suffix}{symbols[len(filler) % len(symbols)]}")

    wordlist = unique_in_order(
        PINNED_WORDLIST_PREFIX
        + CONTEXT_CANDIDATES
        + predictable
        + strong_complex
        + long_phrases
        + filler
    )

    filler_index = 1
    while len(wordlist) < WORDLIST_TARGET_SIZE:
        candidate = f"Candidate{filler_index:03d}!"
        if candidate not in wordlist:
            wordlist.append(candidate)
        filler_index += 1

    return wordlist[:WORDLIST_TARGET_SIZE]


def main() -> None:
    DATA_DIR.mkdir(exist_ok=True)

    with PASSWORDS_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["username", "password", "profile", "risk_label"])
        writer.writerows(SYNTHETIC_USERS)

    WORDLIST_PATH.write_text("\n".join(build_wordlist()) + "\n", encoding="utf-8")

    print(f"Wrote {PASSWORDS_PATH.relative_to(ROOT)} ({len(SYNTHETIC_USERS)} accounts)")
    print(f"Wrote {WORDLIST_PATH.relative_to(ROOT)} ({WORDLIST_TARGET_SIZE} candidates)")


if __name__ == "__main__":
    main()
