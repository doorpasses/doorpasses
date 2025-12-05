require 'spec_helper'

RSpec.describe DoorPasses::Auth do
  describe '.encode_payload' do
    it 'encodes a hash to base64' do
      payload = { id: '123' }
      encoded = described_class.encode_payload(payload)
      expect(encoded).to be_a(String)
      expect(encoded).to eq(Base64.strict_encode64('{"id":"123"}'))
    end

    it 'encodes an array to base64' do
      payload = [1, 2, 3]
      encoded = described_class.encode_payload(payload)
      expect(encoded).to be_a(String)
    end
  end

  describe '.create_signature' do
    it 'creates a SHA256 signature' do
      shared_secret = 'test_secret'
      encoded_payload = 'dGVzdF9wYXlsb2Fk'
      signature = described_class.create_signature(shared_secret, encoded_payload)

      expect(signature).to be_a(String)
      expect(signature.length).to eq(64) # SHA256 hex digest is 64 characters
    end

    it 'creates consistent signatures for same inputs' do
      shared_secret = 'test_secret'
      encoded_payload = 'dGVzdF9wYXlsb2Fk'

      sig1 = described_class.create_signature(shared_secret, encoded_payload)
      sig2 = described_class.create_signature(shared_secret, encoded_payload)

      expect(sig1).to eq(sig2)
    end
  end

  describe '.verify_signature' do
    it 'verifies a valid signature' do
      shared_secret = 'test_secret'
      encoded_payload = 'dGVzdF9wYXlsb2Fk'
      signature = described_class.create_signature(shared_secret, encoded_payload)

      result = described_class.verify_signature(shared_secret, encoded_payload, signature)
      expect(result).to be true
    end

    it 'rejects an invalid signature' do
      shared_secret = 'test_secret'
      encoded_payload = 'dGVzdF9wYXlsb2Fk'
      invalid_signature = 'invalid_signature'

      result = described_class.verify_signature(shared_secret, encoded_payload, invalid_signature)
      expect(result).to be false
    end
  end

  describe '.create_auth_headers' do
    it 'creates headers with payload' do
      account_id = 'test_account'
      shared_secret = 'test_secret'
      payload = { id: '123' }

      headers = described_class.create_auth_headers(account_id, shared_secret, payload)

      expect(headers).to include('X-ACCT-ID' => account_id)
      expect(headers).to include('X-PAYLOAD-SIG')
      expect(headers).to include('Content-Type' => 'application/json')
    end

    it 'creates headers without payload' do
      account_id = 'test_account'
      shared_secret = 'test_secret'

      headers = described_class.create_auth_headers(account_id, shared_secret)

      expect(headers).to include('X-ACCT-ID' => account_id)
      expect(headers).to include('X-PAYLOAD-SIG')
    end
  end

  describe '.create_get_auth_headers' do
    it 'creates headers and returns encoded payload' do
      account_id = 'test_account'
      shared_secret = 'test_secret'
      sig_payload = { id: '123' }

      headers, encoded_payload = described_class.create_get_auth_headers(account_id, shared_secret, sig_payload)

      expect(headers).to include('X-ACCT-ID' => account_id)
      expect(headers).to include('X-PAYLOAD-SIG')
      expect(encoded_payload).to be_a(String)
    end
  end
end
