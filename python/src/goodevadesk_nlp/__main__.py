import argparse
import json

from .classifier import analyze_ticket


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify a GoodevaDesk ticket offline")
    parser.add_argument("--subject", required=True)
    parser.add_argument("--message", required=True)
    args = parser.parse_args()
    print(json.dumps(analyze_ticket(args.subject, args.message).to_dict()))


if __name__ == "__main__":
    main()
