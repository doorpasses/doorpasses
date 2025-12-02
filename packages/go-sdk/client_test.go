package doorpasses

import (
	"testing"
)

func TestNewClient(t *testing.T) {
	tests := []struct {
		name         string
		accountID    string
		sharedSecret string
		config       *Config
		wantErr      bool
	}{
		{
			name:         "valid client",
			accountID:    "test_account",
			sharedSecret: "test_secret",
			config:       nil,
			wantErr:      false,
		},
		{
			name:         "valid client with config",
			accountID:    "test_account",
			sharedSecret: "test_secret",
			config: &Config{
				BaseURL: "https://test.api.doorpasses.io",
			},
			wantErr: false,
		},
		{
			name:         "missing account ID",
			accountID:    "",
			sharedSecret: "test_secret",
			config:       nil,
			wantErr:      true,
		},
		{
			name:         "missing shared secret",
			accountID:    "test_account",
			sharedSecret: "",
			config:       nil,
			wantErr:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			client, err := NewClient(tt.accountID, tt.sharedSecret, tt.config)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewClient() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if client == nil {
					t.Error("NewClient() returned nil client")
				}
				if client.AccessPasses == nil {
					t.Error("NewClient() AccessPasses is nil")
				}
				if client.Console == nil {
					t.Error("NewClient() Console is nil")
				}
			}
		})
	}
}
