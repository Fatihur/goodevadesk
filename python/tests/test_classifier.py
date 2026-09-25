from goodevadesk_nlp import analyze_ticket, classify_category, extract_entities


def test_extracts_email_and_phone_without_external_services():
    entities = extract_entities("Contact support@example.com or +62 812-3456-7890")
    assert entities["emails"] == ["support@example.com"]
    assert entities["phones"] == ["+62 812-3456-7890"]


def test_classifies_common_ticket_categories():
    assert classify_category("Payment failed", "My invoice charge was declined") == "billing"
    assert classify_category("Cannot login", "The app returns an error") == "technical"
    assert classify_category("Question", "Where can I find the documentation?") == "general"


def test_analysis_is_serializable():
    result = analyze_ticket("Payment failed", "Email me at user@example.com")
    assert result.to_dict() == {"category": "billing", "entities": {"emails": ["user@example.com"], "phones": []}}
