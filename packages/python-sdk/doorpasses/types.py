"""Type definitions for DoorPasses SDK."""
from enum import Enum
from typing import Any, Dict, Literal, Optional, TypedDict


class AccessPassState(str, Enum):
    """Access Pass state."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    UNLINKED = "unlinked"
    DELETED = "deleted"
    EXPIRED = "expired"


class Platform(str, Enum):
    """Platform type."""

    APPLE = "apple"
    GOOGLE = "google"


class Protocol(str, Enum):
    """Protocol type."""

    DESFIRE = "desfire"
    SEOS = "seos"
    SMART_TAP = "smart_tap"


class Classification(str, Enum):
    """Classification type."""

    FULL_TIME = "full_time"
    CONTRACTOR = "contractor"
    PART_TIME = "part_time"
    TEMPORARY = "temporary"


class AccountTier(str, Enum):
    """Account tier."""

    BASIC = "BASIC"
    PROFESSIONAL = "PROFESSIONAL"
    ENTERPRISE = "ENTERPRISE"


class UseCase(str, Enum):
    """Use case type."""

    EMPLOYEE_BADGE = "employee_badge"
    HOTEL = "hotel"


class EventDevice(str, Enum):
    """Event device type."""

    MOBILE = "mobile"
    WATCH = "watch"


class EventType(str, Enum):
    """Event type."""

    ISSUE = "issue"
    INSTALL = "install"
    UPDATE = "update"
    SUSPEND = "suspend"
    RESUME = "resume"
    UNLINK = "unlink"


class DoorPassesConfig(TypedDict, total=False):
    """Configuration options for the DoorPasses client."""

    account_id: str
    shared_secret: str
    base_url: Optional[str]
    timeout: Optional[int]


class DoorPassesResponse(TypedDict, total=False):
    """Common response wrapper."""

    success: bool
    data: Optional[Any]
    error: Optional[str]
    message: Optional[str]


class AccessPass(TypedDict, total=False):
    """Access Pass interface."""

    id: str
    cardTemplateId: str
    employeeId: Optional[str]
    tagId: Optional[str]
    siteCode: Optional[str]
    cardNumber: Optional[str]
    fileData: Optional[str]
    fullName: str
    email: Optional[str]
    phoneNumber: Optional[str]
    classification: Optional[str]
    startDate: str
    expirationDate: str
    employeePhoto: Optional[str]
    title: Optional[str]
    state: str
    url: Optional[str]
    metadata: Optional[Dict[str, Any]]
    createdAt: str
    updatedAt: str


class IssueAccessPassParams(TypedDict, total=False):
    """Parameters for issuing an access pass."""

    cardTemplateId: str
    employeeId: Optional[str]
    tagId: Optional[str]
    siteCode: Optional[str]
    cardNumber: str
    fileData: Optional[str]
    fullName: str
    email: Optional[str]
    phoneNumber: Optional[str]
    classification: Optional[str]
    startDate: str
    expirationDate: str
    employeePhoto: Optional[str]
    title: Optional[str]
    metadata: Optional[Dict[str, Any]]


class UpdateAccessPassParams(TypedDict, total=False):
    """Parameters for updating an access pass."""

    accessPassId: str
    employeeId: Optional[str]
    fullName: Optional[str]
    classification: Optional[str]
    expirationDate: Optional[str]
    employeePhoto: Optional[str]
    title: Optional[str]
    fileData: Optional[str]
    metadata: Optional[Dict[str, Any]]


class ListAccessPassesParams(TypedDict, total=False):
    """Parameters for listing access passes."""

    templateId: Optional[str]
    state: Optional[str]


class CardTemplateDesign(TypedDict, total=False):
    """Design configuration for card templates."""

    backgroundColor: Optional[str]
    labelColor: Optional[str]
    labelSecondaryColor: Optional[str]
    backgroundImage: Optional[str]
    logoImage: Optional[str]
    iconImage: Optional[str]


class SupportInfo(TypedDict, total=False):
    """Support information for card templates."""

    supportUrl: Optional[str]
    supportPhoneNumber: Optional[str]
    supportEmail: Optional[str]
    privacyPolicyUrl: Optional[str]
    termsAndConditionsUrl: Optional[str]


class CardTemplate(TypedDict, total=False):
    """Card Template interface."""

    id: str
    name: str
    platform: str
    useCase: str
    protocol: str
    allowOnMultipleDevices: Optional[bool]
    watchCount: Optional[int]
    iphoneCount: Optional[int]
    design: Optional[CardTemplateDesign]
    supportInfo: Optional[SupportInfo]
    metadata: Optional[Dict[str, Any]]
    createdAt: str
    updatedAt: str


class CreateCardTemplateParams(TypedDict, total=False):
    """Parameters for creating a card template."""

    name: str
    platform: str
    useCase: str
    protocol: str
    allowOnMultipleDevices: Optional[bool]
    watchCount: Optional[int]
    iphoneCount: Optional[int]
    design: Optional[CardTemplateDesign]
    supportInfo: Optional[SupportInfo]
    metadata: Optional[Dict[str, Any]]


class UpdateCardTemplateParams(TypedDict, total=False):
    """Parameters for updating a card template."""

    cardTemplateId: str
    name: Optional[str]
    allowOnMultipleDevices: Optional[bool]
    watchCount: Optional[int]
    iphoneCount: Optional[int]
    supportInfo: Optional[SupportInfo]
    metadata: Optional[Dict[str, Any]]


class EventLogEntry(TypedDict, total=False):
    """Event log entry."""

    id: str
    type: str
    timestamp: str
    userId: Optional[str]
    device: Optional[str]
    metadata: Optional[Dict[str, Any]]


class EventLogFilters(TypedDict, total=False):
    """Parameters for filtering event logs."""

    device: Optional[str]
    startDate: Optional[str]
    endDate: Optional[str]
    eventType: Optional[str]


class ReadEventLogParams(TypedDict, total=False):
    """Parameters for reading event logs."""

    cardTemplateId: str
    filters: Optional[EventLogFilters]
