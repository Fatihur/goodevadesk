from __future__ import annotations

import re
from dataclasses import asdict, dataclass

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE_RE = re.compile(r"(?<!\w)(?:\+?\d[\d ()-]{7,}\d)(?!\w)")

KEYWORDS = {
    "billing": {"payment", "invoice", "billing", "charge", "refund", "subscription", "tagihan", "bayar"},
    "technical": {"error", "bug", "crash", "login", "password", "api", "download", "technical", "gagal", "masuk"},
}


@dataclass(frozen=True)
class TicketNlpAnalysis:
    category: str
    entities: dict[str, list[str]]

    def to_dict(self) -> dict[str, object]:
        return asdict(self)


def classify_category(subject: str, message: str) -> str:
    text = f"{subject} {message}".lower()
    scores = {category: sum(text.count(keyword) for keyword in keywords) for category, keywords in KEYWORDS.items()}
    if scores["billing"] == scores["technical"] == 0 or scores["billing"] == scores["technical"]:
        return "general"
    return max(scores, key=scores.get)


def extract_entities(text: str) -> dict[str, list[str]]:
    emails = list(dict.fromkeys(EMAIL_RE.findall(text)))
    phones = list(dict.fromkeys(re.sub(r"\s+", " ", match).strip() for match in PHONE_RE.findall(text)))
    return {"emails": emails, "phones": phones}


def analyze_ticket(subject: str, message: str) -> TicketNlpAnalysis:
    return TicketNlpAnalysis(category=classify_category(subject, message), entities=extract_entities(f"{subject}\n{message}"))


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Classify a GoodevaDesk ticket offline")
    parser.add_argument("--subject", required=True)
    parser.add_argument("--message", required=True)
    args = parser.parse_args()
    print(json.dumps(analyze_ticket(args.subject, args.message).to_dict()))
