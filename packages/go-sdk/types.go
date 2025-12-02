package doorpasses

import "time"

// Config represents configuration options for the DoorPasses client
type Config struct {
	AccountID    string
	SharedSecret string
	BaseURL      string
	Timeout      time.Duration
}

// Response is a common response wrapper
type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}

// AccessPassState represents the state of an access pass
type AccessPassState string

const (
	AccessPassStateActive    AccessPassState = "active"
	AccessPassStateSuspended AccessPassState = "suspended"
	AccessPassStateUnlinked  AccessPassState = "unlinked"
	AccessPassStateDeleted   AccessPassState = "deleted"
	AccessPassStateExpired   AccessPassState = "expired"
)

// Platform represents the platform type
type Platform string

const (
	PlatformApple  Platform = "apple"
	PlatformGoogle Platform = "google"
)

// Protocol represents the protocol type
type Protocol string

const (
	ProtocolDesfire  Protocol = "desfire"
	ProtocolSeos     Protocol = "seos"
	ProtocolSmartTap Protocol = "smart_tap"
)

// Classification represents the employment classification
type Classification string

const (
	ClassificationFullTime  Classification = "full_time"
	ClassificationContractor Classification = "contractor"
	ClassificationPartTime  Classification = "part_time"
	ClassificationTemporary Classification = "temporary"
)

// AccountTier represents the account tier
type AccountTier string

const (
	AccountTierBasic        AccountTier = "BASIC"
	AccountTierProfessional AccountTier = "PROFESSIONAL"
	AccountTierEnterprise   AccountTier = "ENTERPRISE"
)

// AccessPass represents an access pass
type AccessPass struct {
	ID              string                 `json:"id"`
	CardTemplateID  string                 `json:"cardTemplateId"`
	EmployeeID      string                 `json:"employeeId,omitempty"`
	TagID           string                 `json:"tagId,omitempty"`
	SiteCode        string                 `json:"siteCode,omitempty"`
	CardNumber      string                 `json:"cardNumber,omitempty"`
	FileData        string                 `json:"fileData,omitempty"`
	FullName        string                 `json:"fullName"`
	Email           string                 `json:"email,omitempty"`
	PhoneNumber     string                 `json:"phoneNumber,omitempty"`
	Classification  Classification         `json:"classification,omitempty"`
	StartDate       string                 `json:"startDate"`
	ExpirationDate  string                 `json:"expirationDate"`
	EmployeePhoto   string                 `json:"employeePhoto,omitempty"`
	Title           string                 `json:"title,omitempty"`
	State           AccessPassState        `json:"state"`
	URL             string                 `json:"url,omitempty"`
	Metadata        map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt       string                 `json:"createdAt"`
	UpdatedAt       string                 `json:"updatedAt"`
}

// IssueAccessPassParams represents parameters for issuing an access pass
type IssueAccessPassParams struct {
	CardTemplateID string                 `json:"cardTemplateId"`
	EmployeeID     string                 `json:"employeeId,omitempty"`
	TagID          string                 `json:"tagId,omitempty"`
	SiteCode       string                 `json:"siteCode,omitempty"`
	CardNumber     string                 `json:"cardNumber"`
	FileData       string                 `json:"fileData,omitempty"`
	FullName       string                 `json:"fullName"`
	Email          string                 `json:"email,omitempty"`
	PhoneNumber    string                 `json:"phoneNumber,omitempty"`
	Classification Classification         `json:"classification,omitempty"`
	StartDate      string                 `json:"startDate"`
	ExpirationDate string                 `json:"expirationDate"`
	EmployeePhoto  string                 `json:"employeePhoto,omitempty"`
	Title          string                 `json:"title,omitempty"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
}

// UpdateAccessPassParams represents parameters for updating an access pass
type UpdateAccessPassParams struct {
	AccessPassID   string                 `json:"-"`
	EmployeeID     string                 `json:"employeeId,omitempty"`
	FullName       string                 `json:"fullName,omitempty"`
	Classification Classification         `json:"classification,omitempty"`
	ExpirationDate string                 `json:"expirationDate,omitempty"`
	EmployeePhoto  string                 `json:"employeePhoto,omitempty"`
	Title          string                 `json:"title,omitempty"`
	FileData       string                 `json:"fileData,omitempty"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
}

// ListAccessPassesParams represents parameters for listing access passes
type ListAccessPassesParams struct {
	TemplateID string          `json:"template_id,omitempty"`
	State      AccessPassState `json:"state,omitempty"`
}

// CardTemplateDesign represents design configuration for card templates
type CardTemplateDesign struct {
	BackgroundColor      string `json:"backgroundColor,omitempty"`
	LabelColor           string `json:"labelColor,omitempty"`
	LabelSecondaryColor  string `json:"labelSecondaryColor,omitempty"`
	BackgroundImage      string `json:"backgroundImage,omitempty"`
	LogoImage            string `json:"logoImage,omitempty"`
	IconImage            string `json:"iconImage,omitempty"`
}

// SupportInfo represents support information for card templates
type SupportInfo struct {
	SupportURL            string `json:"supportUrl,omitempty"`
	SupportPhoneNumber    string `json:"supportPhoneNumber,omitempty"`
	SupportEmail          string `json:"supportEmail,omitempty"`
	PrivacyPolicyURL      string `json:"privacyPolicyUrl,omitempty"`
	TermsAndConditionsURL string `json:"termsAndConditionsUrl,omitempty"`
}

// UseCase represents the use case for a card template
type UseCase string

const (
	UseCaseEmployeeBadge UseCase = "employee_badge"
	UseCaseHotel         UseCase = "hotel"
)

// CardTemplate represents a card template
type CardTemplate struct {
	ID                     string                 `json:"id"`
	Name                   string                 `json:"name"`
	Platform               Platform               `json:"platform"`
	UseCase                UseCase                `json:"useCase"`
	Protocol               Protocol               `json:"protocol"`
	AllowOnMultipleDevices *bool                  `json:"allowOnMultipleDevices,omitempty"`
	WatchCount             *int                   `json:"watchCount,omitempty"`
	IPhoneCount            *int                   `json:"iphoneCount,omitempty"`
	Design                 *CardTemplateDesign    `json:"design,omitempty"`
	SupportInfo            *SupportInfo           `json:"supportInfo,omitempty"`
	Metadata               map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt              string                 `json:"createdAt"`
	UpdatedAt              string                 `json:"updatedAt"`
}

// CreateCardTemplateParams represents parameters for creating a card template
type CreateCardTemplateParams struct {
	Name                   string                 `json:"name"`
	Platform               Platform               `json:"platform"`
	UseCase                UseCase                `json:"useCase"`
	Protocol               Protocol               `json:"protocol"`
	AllowOnMultipleDevices *bool                  `json:"allowOnMultipleDevices,omitempty"`
	WatchCount             *int                   `json:"watchCount,omitempty"`
	IPhoneCount            *int                   `json:"iphoneCount,omitempty"`
	Design                 *CardTemplateDesign    `json:"design,omitempty"`
	SupportInfo            *SupportInfo           `json:"supportInfo,omitempty"`
	Metadata               map[string]interface{} `json:"metadata,omitempty"`
}

// UpdateCardTemplateParams represents parameters for updating a card template
type UpdateCardTemplateParams struct {
	CardTemplateID         string                 `json:"-"`
	Name                   string                 `json:"name,omitempty"`
	AllowOnMultipleDevices *bool                  `json:"allowOnMultipleDevices,omitempty"`
	WatchCount             *int                   `json:"watchCount,omitempty"`
	IPhoneCount            *int                   `json:"iphoneCount,omitempty"`
	SupportInfo            *SupportInfo           `json:"supportInfo,omitempty"`
	Metadata               map[string]interface{} `json:"metadata,omitempty"`
}

// EventType represents the type of event
type EventType string

const (
	EventTypeIssue   EventType = "issue"
	EventTypeInstall EventType = "install"
	EventTypeUpdate  EventType = "update"
	EventTypeSuspend EventType = "suspend"
	EventTypeResume  EventType = "resume"
	EventTypeUnlink  EventType = "unlink"
)

// DeviceType represents the type of device
type DeviceType string

const (
	DeviceTypeMobile DeviceType = "mobile"
	DeviceTypeWatch  DeviceType = "watch"
)

// EventLogEntry represents an event log entry
type EventLogEntry struct {
	ID        string                 `json:"id"`
	Type      string                 `json:"type"`
	Timestamp string                 `json:"timestamp"`
	UserID    string                 `json:"userId,omitempty"`
	Device    string                 `json:"device,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// EventLogFilters represents filters for event logs
type EventLogFilters struct {
	Device    DeviceType `json:"device,omitempty"`
	StartDate string     `json:"start_date,omitempty"`
	EndDate   string     `json:"end_date,omitempty"`
	EventType EventType  `json:"event_type,omitempty"`
}

// ReadEventLogParams represents parameters for reading event logs
type ReadEventLogParams struct {
	CardTemplateID string           `json:"-"`
	Filters        *EventLogFilters `json:"filters,omitempty"`
}

// SuccessResponse represents a simple success response
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
