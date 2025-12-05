require 'spec_helper'

RSpec.describe DoorPasses::Resources::Console do
  let(:account_id) { 'test_account_id' }
  let(:shared_secret) { 'test_shared_secret' }
  let(:base_url) { 'https://api.doorpasses.io' }
  let(:client) { DoorPasses::Client.new(account_id, shared_secret, base_url: base_url) }
  let(:console) { client.console }

  describe '#create_template' do
    it 'creates a new card template' do
      params = {
        name: 'Employee Badge',
        platform: 'apple',
        use_case: 'employee_badge',
        protocol: 'desfire'
      }

      stub_request(:post, "#{base_url}/v1/console/templates")
        .to_return(status: 200, body: '{"id":"template_123"}', headers: { 'Content-Type' => 'application/json' })

      response = console.create_template(params)

      expect(response).to include('id' => 'template_123')
    end
  end

  describe '#update_template' do
    it 'updates a card template' do
      params = {
        card_template_id: 'template_123',
        name: 'Updated Badge'
      }

      stub_request(:patch, "#{base_url}/v1/console/templates/template_123")
        .to_return(status: 200, body: '{"id":"template_123","name":"Updated Badge"}',
                   headers: { 'Content-Type' => 'application/json' })

      response = console.update_template(params)

      expect(response).to include('id' => 'template_123')
    end

    it 'raises error without card_template_id' do
      expect do
        console.update_template(name: 'Updated Badge')
      end.to raise_error(ArgumentError, 'card_template_id is required')
    end
  end

  describe '#read_template' do
    it 'reads a card template' do
      stub_request(:get, "#{base_url}/v1/console/templates/template_123")
        .to_return(status: 200, body: '{"id":"template_123","name":"Employee Badge"}',
                   headers: { 'Content-Type' => 'application/json' })

      response = console.read_template('template_123')

      expect(response).to include('id' => 'template_123')
    end

    it 'raises error without card_template_id' do
      expect do
        console.read_template(nil)
      end.to raise_error(ArgumentError, 'card_template_id is required')
    end
  end

  describe '#event_log' do
    it 'reads event log for a template' do
      params = {
        card_template_id: 'template_123',
        filters: { event_type: 'install' }
      }

      stub_request(:get, "#{base_url}/v1/console/templates/template_123/events")
        .to_return(status: 200, body: '[{"type":"install","timestamp":"2025-11-02T00:00:00Z"}]',
                   headers: { 'Content-Type' => 'application/json' })

      response = console.event_log(params)

      expect(response).to be_an(Array)
      expect(response.first).to include('type' => 'install')
    end

    it 'raises error without card_template_id' do
      expect do
        console.event_log(filters: {})
      end.to raise_error(ArgumentError, 'card_template_id is required')
    end
  end

  describe '#ios_preflight' do
    it 'gets iOS provisioning identifiers' do
      params = {
        card_template_id: 'template_123',
        access_pass_ex_id: 'pass_123'
      }

      stub_request(:get, "#{base_url}/v1/console/ios-preflight")
        .to_return(status: 200, body: '{"provisioningCredentialIdentifier":"abc123"}',
                   headers: { 'Content-Type' => 'application/json' })

      response = console.ios_preflight(params)

      expect(response).to include('provisioningCredentialIdentifier' => 'abc123')
    end

    it 'raises error without card_template_id' do
      expect do
        console.ios_preflight(access_pass_ex_id: 'pass_123')
      end.to raise_error(ArgumentError, 'card_template_id is required')
    end

    it 'raises error without access_pass_ex_id' do
      expect do
        console.ios_preflight(card_template_id: 'template_123')
      end.to raise_error(ArgumentError, 'access_pass_ex_id is required')
    end
  end
end
