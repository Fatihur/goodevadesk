# Optional Python NLP

This small, dependency-free module is a deterministic fallback for ticket triage. It extracts email/phone entities and applies a keyword classifier for `billing`, `technical`, and `general` tickets. The production API invokes it when the configured LLM is unavailable, while it can also be used for local evaluation or batch analysis without network access.

```powershell
python -m pip install -e ".[test]"
python -m pytest
python -m goodevadesk_nlp --subject "Payment failed" --message "Contact me at customer@example.com"
```
