"""
DoorPasses SDK - Official Python SDK for DoorPasses Digital Access Control Platform.

Example:
    >>> from doorpasses import DoorPasses
    >>> client = DoorPasses(account_id, shared_secret)
    >>> access_pass = client.access_passes.issue({...})
"""

__version__ = "1.0.0"

from .auth import create_signature, encode_payload, verify_signature
from .client import DoorPasses
from .resources import AccessPasses, Console
from .types import (
    AccessPass,
    AccessPassState,
    AccountTier,
    CardTemplate,
    CardTemplateDesign,
    Classification,
    CreateCardTemplateParams,
    DoorPassesConfig,
    DoorPassesResponse,
    EventLogEntry,
    EventLogFilters,
    IssueAccessPassParams,
    ListAccessPassesParams,
    Platform,
    Protocol,
    ReadEventLogParams,
    SupportInfo,
    UpdateAccessPassParams,
    UpdateCardTemplateParams,
)

__all__ = [
    # Main client
    "DoorPasses",
    # Resources
    "AccessPasses",
    "Console",
    # Types
    "DoorPassesConfig",
    "DoorPassesResponse",
    "AccessPass",
    "AccessPassState",
    "IssueAccessPassParams",
    "UpdateAccessPassParams",
    "ListAccessPassesParams",
    "CardTemplate",
    "CreateCardTemplateParams",
    "UpdateCardTemplateParams",
    "CardTemplateDesign",
    "SupportInfo",
    "EventLogEntry",
    "EventLogFilters",
    "ReadEventLogParams",
    "Platform",
    "Protocol",
    "Classification",
    "AccountTier",
    # Auth utilities
    "encode_payload",
    "create_signature",
    "verify_signature",
]
