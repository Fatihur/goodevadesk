# Optional Python NLP

This small, dependency-free module is a value-add for offline ticket triage. It extracts email/phone entities and applies a deterministic keyword classifier for `billing`, `technical`, and `general` tickets. The production API keeps its provider-backed LLM enrichment path; this module can be used for local evaluation, fallback experiments, or batch analysis without network access.

```powershell
python -m pip install -e ".[test]"
python -m pytest
python -m goodevadesk_nlp --subject "Payment failed" --message "Contact me at customer@example.com"
```
