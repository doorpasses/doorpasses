require 'base64'
require 'json'
require 'digest'

module DoorPasses
  # Authentication utilities for DoorPasses SDK
  module Auth
    # Encodes a payload to base64
    #
    # @param payload [Hash, Array, Object] The payload to encode
    # @return [String] Base64 encoded string
    def self.encode_payload(payload)
      json_string = JSON.generate(payload)
      Base64.strict_encode64(json_string)
    end

    # Creates a signature for a payload using the shared secret
    # Uses SHA256(shared_secret + base64_encoded_payload).hexdigest()
    #
    # @param shared_secret [String] The shared secret key
    # @param encoded_payload [String] Base64 encoded payload
    # @return [String] Hex digest of the SHA256 hash
    def self.create_signature(shared_secret, encoded_payload)
      message = shared_secret + encoded_payload
      Digest::SHA256.hexdigest(message)
    end

    # Verifies a signature matches the expected value
    #
    # @param shared_secret [String] The shared secret key
    # @param encoded_payload [String] Base64 encoded payload
    # @param signature [String] The signature to verify
    # @return [Boolean] True if signature is valid, false otherwise
    def self.verify_signature?(shared_secret, encoded_payload, signature)
      expected_signature = create_signature(shared_secret, encoded_payload)
      expected_signature == signature
    end

    # Creates authentication headers for API requests
    #
    # @param account_id [String] Your DoorPasses account ID
    # @param shared_secret [String] Your DoorPasses shared secret
    # @param payload [Hash, nil] Optional payload for the request
    # @return [Hash] Dictionary of headers
    def self.create_auth_headers(account_id, shared_secret, payload = nil)
      encoded_payload = if payload && (!payload.is_a?(Hash) || !payload.empty?)
                          encode_payload(payload)
                        else
                          # Default payload when no body is provided
                          encode_payload({ id: '0' })
                        end

      signature = create_signature(shared_secret, encoded_payload)

      {
        'X-ACCT-ID' => account_id,
        'X-PAYLOAD-SIG' => signature,
        'Content-Type' => 'application/json'
      }
    end

    # Creates authentication headers for GET requests
    #
    # @param account_id [String] Your DoorPasses account ID
    # @param shared_secret [String] Your DoorPasses shared secret
    # @param sig_payload [Hash, nil] Optional signature payload
    # @return [Array<Hash, String>] Tuple of (headers hash, encoded_payload string)
    def self.create_get_auth_headers(account_id, shared_secret, sig_payload = nil)
      payload = sig_payload || { id: '0' }
      encoded_payload = encode_payload(payload)
      signature = create_signature(shared_secret, encoded_payload)

      headers = {
        'X-ACCT-ID' => account_id,
        'X-PAYLOAD-SIG' => signature,
        'Content-Type' => 'application/json'
      }

      [headers, encoded_payload]
    end
  end
end
