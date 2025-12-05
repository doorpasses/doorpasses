package doorpasses

import (
	"testing"
)

func TestEncodePayload(t *testing.T) {
	tests := []struct {
		name    string
		payload interface{}
		want    string
		wantErr bool
	}{
		{
			name:    "simple payload",
			payload: map[string]string{"id": "0"},
			want:    "eyJpZCI6IjAifQ==",
			wantErr: false,
		},
		{
			name:    "complex payload",
			payload: map[string]interface{}{"name": "test", "count": 5},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := encodePayload(tt.payload)
			if (err != nil) != tt.wantErr {
				t.Errorf("encodePayload() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if tt.want != "" && got != tt.want {
				t.Errorf("encodePayload() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCreateSignature(t *testing.T) {
	sharedSecret := "test_secret"
	encodedPayload := "eyJpZCI6IjAifQ=="

	signature := createSignature(sharedSecret, encodedPayload)

	if signature == "" {
		t.Error("createSignature() returned empty signature")
	}

	// Signature should be deterministic
	signature2 := createSignature(sharedSecret, encodedPayload)
	if signature != signature2 {
		t.Error("createSignature() not deterministic")
	}
}

func TestVerifySignature(t *testing.T) {
	sharedSecret := "test_secret"
	encodedPayload := "eyJpZCI6IjAifQ=="
	signature := createSignature(sharedSecret, encodedPayload)

	tests := []struct {
		name             string
		sharedSecret     string
		encodedPayload   string
		signature        string
		want             bool
	}{
		{
			name:           "valid signature",
			sharedSecret:   sharedSecret,
			encodedPayload: encodedPayload,
			signature:      signature,
			want:           true,
		},
		{
			name:           "invalid signature",
			sharedSecret:   sharedSecret,
			encodedPayload: encodedPayload,
			signature:      "invalid",
			want:           false,
		},
		{
			name:           "wrong secret",
			sharedSecret:   "wrong_secret",
			encodedPayload: encodedPayload,
			signature:      signature,
			want:           false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := verifySignature(tt.sharedSecret, tt.encodedPayload, tt.signature)
			if got != tt.want {
				t.Errorf("verifySignature() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestCreateAuthHeaders(t *testing.T) {
	accountID := "test_account"
	sharedSecret := "test_secret"

	tests := []struct {
		name    string
		payload interface{}
		wantErr bool
	}{
		{
			name:    "with payload",
			payload: map[string]string{"test": "data"},
			wantErr: false,
		},
		{
			name:    "without payload",
			payload: nil,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			headers, err := createAuthHeaders(accountID, sharedSecret, tt.payload)
			if (err != nil) != tt.wantErr {
				t.Errorf("createAuthHeaders() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if headers["X-ACCT-ID"] != accountID {
					t.Errorf("X-ACCT-ID = %v, want %v", headers["X-ACCT-ID"], accountID)
				}
				if headers["X-PAYLOAD-SIG"] == "" {
					t.Error("X-PAYLOAD-SIG is empty")
				}
				if headers["Content-Type"] != "application/json" {
					t.Errorf("Content-Type = %v, want application/json", headers["Content-Type"])
				}
			}
		})
	}
}

func TestCreateGetAuthHeaders(t *testing.T) {
	accountID := "test_account"
	sharedSecret := "test_secret"

	tests := []struct {
		name       string
		sigPayload map[string]interface{}
		wantErr    bool
	}{
		{
			name:       "with sig payload",
			sigPayload: map[string]interface{}{"id": "123"},
			wantErr:    false,
		},
		{
			name:       "without sig payload",
			sigPayload: nil,
			wantErr:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			headers, encodedPayload, err := createGetAuthHeaders(accountID, sharedSecret, tt.sigPayload)
			if (err != nil) != tt.wantErr {
				t.Errorf("createGetAuthHeaders() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if headers["X-ACCT-ID"] != accountID {
					t.Errorf("X-ACCT-ID = %v, want %v", headers["X-ACCT-ID"], accountID)
				}
				if headers["X-PAYLOAD-SIG"] == "" {
					t.Error("X-PAYLOAD-SIG is empty")
				}
				if encodedPayload == "" {
					t.Error("encodedPayload is empty")
				}
			}
		})
	}
}
