"""Pytest configuration and fixtures."""
import pytest


@pytest.fixture
def account_id():
    """Test account ID fixture."""
    return "test_account_id"


@pytest.fixture
def shared_secret():
    """Test shared secret fixture."""
    return "test_shared_secret"


@pytest.fixture
def doorpasses_client(account_id, shared_secret):
    """DoorPasses client fixture."""
    from doorpasses import DoorPasses

    return DoorPasses(account_id, shared_secret)
