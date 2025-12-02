package doorpasses

import "fmt"

// Console provides methods for managing card templates (Enterprise only)
type Console struct {
	http *HTTPClient
}

// newConsole creates a new Console resource
func newConsole(httpClient *HTTPClient) *Console {
	return &Console{
		http: httpClient,
	}
}

// CreateTemplate creates a new card template
// Requires Enterprise tier
func (c *Console) CreateTemplate(params CreateCardTemplateParams) (*CardTemplate, error) {
	var result CardTemplate
	err := c.http.Post("/v1/console/card-templates", params, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// ReadTemplate retrieves a card template by ID
// Requires Enterprise tier
func (c *Console) ReadTemplate(cardTemplateID string) (*CardTemplate, error) {
	if cardTemplateID == "" {
		return nil, fmt.Errorf("cardTemplateId is required")
	}

	sigPayload := map[string]interface{}{
		"id": cardTemplateID,
	}

	var result CardTemplate
	err := c.http.Get(fmt.Sprintf("/v1/console/card-templates/%s", cardTemplateID), sigPayload, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// UpdateTemplate updates an existing card template
// Requires Enterprise tier
func (c *Console) UpdateTemplate(params UpdateCardTemplateParams) (*CardTemplate, error) {
	if params.CardTemplateID == "" {
		return nil, fmt.Errorf("cardTemplateId is required")
	}

	var result CardTemplate
	err := c.http.Patch(fmt.Sprintf("/v1/console/card-templates/%s", params.CardTemplateID), params, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// PublishTemplate publishes a card template
// Requires Enterprise tier
func (c *Console) PublishTemplate(cardTemplateID string) (*SuccessResponse, error) {
	if cardTemplateID == "" {
		return nil, fmt.Errorf("cardTemplateId is required")
	}

	var result SuccessResponse
	err := c.http.Post(fmt.Sprintf("/v1/console/card-templates/%s/publish", cardTemplateID), nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// EventLog retrieves event logs for a card template
// Requires Enterprise tier
func (c *Console) EventLog(params ReadEventLogParams) ([]EventLogEntry, error) {
	if params.CardTemplateID == "" {
		return nil, fmt.Errorf("cardTemplateId is required")
	}

	sigPayload := map[string]interface{}{
		"id": params.CardTemplateID,
	}

	if params.Filters != nil {
		if params.Filters.Device != "" {
			sigPayload["device"] = params.Filters.Device
		}
		if params.Filters.StartDate != "" {
			sigPayload["start_date"] = params.Filters.StartDate
		}
		if params.Filters.EndDate != "" {
			sigPayload["end_date"] = params.Filters.EndDate
		}
		if params.Filters.EventType != "" {
			sigPayload["event_type"] = params.Filters.EventType
		}
	}

	var result []EventLogEntry
	err := c.http.Get(fmt.Sprintf("/v1/console/card-templates/%s/logs", params.CardTemplateID), sigPayload, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
