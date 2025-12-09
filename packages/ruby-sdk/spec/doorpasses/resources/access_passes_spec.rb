require 'spec_helper'

RSpec.describe DoorPasses::Resources::AccessPasses do
  let(:account_id) { 'test_account_id' }
  let(:shared_secret) { 'test_shared_secret' }
  let(:base_url) { 'https://api.doorpasses.io' }
  let(:client) { DoorPasses::Client.new(account_id, shared_secret, base_url: base_url) }
  let(:access_passes) { client.access_passes }

  describe '#issue' do
    it 'issues a new access pass' do
      params = {
        card_template_id: 'template_123',
        full_name: 'John Doe',
        email: 'john@example.com',
        card_number: '12345',
        start_date: '2025-11-01T00:00:00Z',
        expiration_date: '2026-11-01T00:00:00Z'
      }

      stub_request(:post, "#{base_url}/v1/access-passes")
        .to_return(status: 200, body: '{"id":"pass_123","url":"https://install.url"}',
                   headers: { 'Content-Type' => 'application/json' })

      response = access_passes.issue(params)

      expect(response).to include('id' => 'pass_123')
      expect(response).to include('url' => 'https://install.url')
    end
  end

  describe '#list' do
    it 'lists all access passes' do
      stub_request(:get, "#{base_url}/v1/access-passes")
        .to_return(status: 200, body: '[{"id":"pass_123"}]', headers: { 'Content-Type' => 'application/json' })

      response = access_passes.list

      expect(response).to be_an(Array)
      expect(response.first).to include('id' => 'pass_123')
    end

    it 'lists access passes with filters' do
      stub_request(:get, "#{base_url}/v1/access-passes")
        .to_return(status: 200, body: '[{"id":"pass_123"}]', headers: { 'Content-Type' => 'application/json' })

      response = access_passes.list(template_id: 'template_123', state: 'active')

      expect(response).to be_an(Array)
    end
  end

  describe '#update' do
    it 'updates an access pass' do
      params = {
        card_id: 'pass_123',
        full_name: 'Jane Doe'
      }

      stub_request(:patch, "#{base_url}/v1/access-passes/pass_123")
        .to_return(status: 200, body: '{"id":"pass_123","full_name":"Jane Doe"}',
                   headers: { 'Content-Type' => 'application/json' })

      response = access_passes.update(params)

      expect(response).to include('id' => 'pass_123')
    end

    it 'raises error without card_id' do
      expect do
        access_passes.update(full_name: 'Jane Doe')
      end.to raise_error(ArgumentError, 'card_id is required')
    end
  end

  describe '#suspend' do
    it 'suspends an access pass' do
      stub_request(:post, "#{base_url}/v1/access-passes/pass_123/suspend")
        .to_return(status: 200, body: '{"success":true}', headers: { 'Content-Type' => 'application/json' })

      response = access_passes.suspend('pass_123')

      expect(response).to include('success' => true)
    end

    it 'raises error without card_id' do
      expect do
        access_passes.suspend(nil)
      end.to raise_error(ArgumentError, 'card_id is required')
    end
  end

  describe '#resume' do
    it 'resumes an access pass' do
      stub_request(:post, "#{base_url}/v1/access-passes/pass_123/resume")
        .to_return(status: 200, body: '{"success":true}', headers: { 'Content-Type' => 'application/json' })

      response = access_passes.resume('pass_123')

      expect(response).to include('success' => true)
    end
  end

  describe '#unlink' do
    it 'unlinks an access pass' do
      stub_request(:post, "#{base_url}/v1/access-passes/pass_123/unlink")
        .to_return(status: 200, body: '{"success":true}', headers: { 'Content-Type' => 'application/json' })

      response = access_passes.unlink('pass_123')

      expect(response).to include('success' => true)
    end
  end

  describe '#delete' do
    it 'deletes an access pass' do
      stub_request(:post, "#{base_url}/v1/access-passes/pass_123/delete")
        .to_return(status: 200, body: '{"success":true}', headers: { 'Content-Type' => 'application/json' })

      response = access_passes.delete('pass_123')

      expect(response).to include('success' => true)
    end
  end
end
