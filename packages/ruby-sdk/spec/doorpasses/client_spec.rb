require 'spec_helper'

RSpec.describe DoorPasses::Client do
  let(:account_id) { 'test_account_id' }
  let(:shared_secret) { 'test_shared_secret' }
  let(:base_url) { 'https://api.doorpasses.io' }

  describe '#initialize' do
    it 'creates a new client with required parameters' do
      client = described_class.new(account_id, shared_secret)
      expect(client).to be_a(described_class)
      expect(client.access_passes).to be_a(DoorPasses::Resources::AccessPasses)
      expect(client.console).to be_a(DoorPasses::Resources::Console)
    end

    it 'raises error without account_id' do
      expect do
        described_class.new(nil, shared_secret)
      end.to raise_error(ArgumentError, 'account_id is required')
    end

    it 'raises error without shared_secret' do
      expect do
        described_class.new(account_id, nil)
      end.to raise_error(ArgumentError, 'shared_secret is required')
    end

    it 'accepts custom base_url' do
      custom_url = 'https://custom.doorpasses.io'
      client = described_class.new(account_id, shared_secret, base_url: custom_url)
      expect(client).to be_a(described_class)
    end

    it 'accepts custom timeout' do
      client = described_class.new(account_id, shared_secret, timeout: 60_000)
      expect(client).to be_a(described_class)
    end
  end

  describe '#health' do
    it 'makes a GET request to /health' do
      stub_request(:get, "#{base_url}/health")
        .to_return(status: 200, body: '{"status":"ok"}', headers: { 'Content-Type' => 'application/json' })

      client = described_class.new(account_id, shared_secret)
      response = client.health

      expect(response).to eq('status' => 'ok')
    end
  end
end
