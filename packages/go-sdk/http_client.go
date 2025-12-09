package doorpasses

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// HTTPClient handles authenticated requests to the DoorPasses API
type HTTPClient struct {
	client       *http.Client
	accountID    string
	sharedSecret string
	baseURL      string
}

// NewHTTPClient creates a new HTTP client
func NewHTTPClient(accountID, sharedSecret, baseURL string, timeout time.Duration) *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: timeout,
		},
		accountID:    accountID,
		sharedSecret: sharedSecret,
		baseURL:      baseURL,
	}
}

// Get makes a GET request
func (c *HTTPClient) Get(path string, sigPayload map[string]interface{}, result interface{}) error {
	headers, encodedPayload, err := createGetAuthHeaders(c.accountID, c.sharedSecret, sigPayload)
	if err != nil {
		return fmt.Errorf("failed to create auth headers: %w", err)
	}

	// Build URL with query parameter
	fullURL := c.baseURL + path
	if encodedPayload != "" {
		parsedURL, err := url.Parse(fullURL)
		if err != nil {
			return fmt.Errorf("failed to parse URL: %w", err)
		}
		q := parsedURL.Query()
		q.Set("sig_payload", encodedPayload)
		parsedURL.RawQuery = q.Encode()
		fullURL = parsedURL.String()
	}

	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	return c.doRequest(req, result)
}

// Post makes a POST request
func (c *HTTPClient) Post(path string, data interface{}, result interface{}) error {
	headers, err := createAuthHeaders(c.accountID, c.sharedSecret, data)
	if err != nil {
		return fmt.Errorf("failed to create auth headers: %w", err)
	}

	var body []byte
	if data != nil {
		body, err = json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal request body: %w", err)
		}
	}

	req, err := http.NewRequest("POST", c.baseURL+path, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	return c.doRequest(req, result)
}

// Patch makes a PATCH request
func (c *HTTPClient) Patch(path string, data interface{}, result interface{}) error {
	headers, err := createAuthHeaders(c.accountID, c.sharedSecret, data)
	if err != nil {
		return fmt.Errorf("failed to create auth headers: %w", err)
	}

	var body []byte
	if data != nil {
		body, err = json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal request body: %w", err)
		}
	}

	req, err := http.NewRequest("PATCH", c.baseURL+path, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	return c.doRequest(req, result)
}

// Delete makes a DELETE request
func (c *HTTPClient) Delete(path string, result interface{}) error {
	headers, err := createAuthHeaders(c.accountID, c.sharedSecret, nil)
	if err != nil {
		return fmt.Errorf("failed to create auth headers: %w", err)
	}

	req, err := http.NewRequest("DELETE", c.baseURL+path, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	for key, value := range headers {
		req.Header.Set(key, value)
	}

	return c.doRequest(req, result)
}

// doRequest executes the HTTP request and handles the response
func (c *HTTPClient) doRequest(req *http.Request, result interface{}) error {
	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errorResp struct {
			Error   string `json:"error"`
			Message string `json:"message"`
		}
		if err := json.Unmarshal(body, &errorResp); err == nil {
			errorMsg := errorResp.Error
			if errorMsg == "" {
				errorMsg = errorResp.Message
			}
			if errorMsg != "" {
				return fmt.Errorf("DoorPasses API Error (%d): %s", resp.StatusCode, errorMsg)
			}
		}
		return fmt.Errorf("DoorPasses API Error (%d): %s", resp.StatusCode, string(body))
	}

	if result != nil {
		// Try to unmarshal as a response with data field
		var dataResp struct {
			Data json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(body, &dataResp); err == nil && len(dataResp.Data) > 0 {
			if err := json.Unmarshal(dataResp.Data, result); err != nil {
				return fmt.Errorf("failed to unmarshal data field: %w", err)
			}
		} else {
			// Otherwise unmarshal directly
			if err := json.Unmarshal(body, result); err != nil {
				return fmt.Errorf("failed to unmarshal response: %w", err)
			}
		}
	}

	return nil
}
