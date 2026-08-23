import pytest

from src.attribute_types import registry


def test_email_type_is_registered():
    definition = next(
        item for item in registry.ATTRIBUTE_TYPE_REGISTRY if item.key == "email"
    )

    assert definition.key == "email"
    assert definition.name == "Email"


def test_email_type_accepts_a_valid_email():
    registry.validate_attribute_value("email", "jane@example.com")


def test_email_type_allows_whitespace_only_value():
    registry.validate_attribute_value("email", "    ")


def test_email_type_rejects_invalid_email():
    with pytest.raises(ValueError):
        registry.validate_attribute_value("email", "not-an-email")
