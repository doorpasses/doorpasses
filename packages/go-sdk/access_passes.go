package doorpasses

import "fmt"

// AccessPasses provides methods for managing access passes
type AccessPasses struct {
	http *HTTPClient
}

// newAccessPasses creates a new AccessPasses resource
func newAccessPasses(httpClient *HTTPClient) *AccessPasses {
	return &AccessPasses{
		http: httpClient,
	}
}

// Issue creates a new access pass
func (a *AccessPasses) Issue(params IssueAccessPassParams) (*AccessPass, error) {
	var result AccessPass
	err := a.http.Post("/v1/access-passes", params, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// List retrieves access passes with optional filtering
func (a *AccessPasses) List(params *ListAccessPassesParams) ([]AccessPass, error) {
	sigPayload := make(map[string]interface{})

	if params != nil {
		if params.TemplateID != "" {
			sigPayload["template_id"] = params.TemplateID
		}
		if params.State != "" {
			sigPayload["state"] = params.State
		}
	}

	var result []AccessPass
	err := a.http.Get("/v1/access-passes", sigPayload, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

// Update updates an existing access pass
func (a *AccessPasses) Update(params UpdateAccessPassParams) (*AccessPass, error) {
	if params.AccessPassID == "" {
		return nil, fmt.Errorf("accessPassId is required")
	}

	var result AccessPass
	err := a.http.Patch(fmt.Sprintf("/v1/access-passes/%s", params.AccessPassID), params, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// Suspend suspends an access pass
func (a *AccessPasses) Suspend(accessPassID string) (*SuccessResponse, error) {
	if accessPassID == "" {
		return nil, fmt.Errorf("accessPassId is required")
	}

	var result SuccessResponse
	err := a.http.Post(fmt.Sprintf("/v1/access-passes/%s/suspend", accessPassID), nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// Resume resumes a suspended access pass
func (a *AccessPasses) Resume(accessPassID string) (*SuccessResponse, error) {
	if accessPassID == "" {
		return nil, fmt.Errorf("accessPassId is required")
	}

	var result SuccessResponse
	err := a.http.Post(fmt.Sprintf("/v1/access-passes/%s/resume", accessPassID), nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// Unlink unlinks an access pass from the user's device
func (a *AccessPasses) Unlink(accessPassID string) (*SuccessResponse, error) {
	if accessPassID == "" {
		return nil, fmt.Errorf("accessPassId is required")
	}

	var result SuccessResponse
	err := a.http.Post(fmt.Sprintf("/v1/access-passes/%s/unlink", accessPassID), nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// Delete permanently deletes an access pass
func (a *AccessPasses) Delete(accessPassID string) (*SuccessResponse, error) {
	if accessPassID == "" {
		return nil, fmt.Errorf("accessPassId is required")
	}

	var result SuccessResponse
	err := a.http.Post(fmt.Sprintf("/v1/access-passes/%s/delete", accessPassID), nil, &result)
	if err != nil {
		return nil, err
	}
	return &result, nil
}
