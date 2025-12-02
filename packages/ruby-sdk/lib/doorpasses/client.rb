require_relative 'http_client'
require_relative 'resources/access_passes'
require_relative 'resources/console'

module DoorPasses
  # Main DoorPasses SDK client
  #
  # @example
  #   require 'doorpasses'
  #
  #   account_id = ENV['DOORPASSES_ACCOUNT_ID']
  #   shared_secret = ENV['DOORPASSES_SHARED_SECRET']
  #
  #   client = DoorPasses::Client.new(account_id, shared_secret)
  #
  #   # Issue an access pass
  #   access_pass = client.access_passes.issue(
  #     card_template_id: "template_123",
  #     full_name: "John Doe",
  #     email: "john@example.com",
  #     card_number: "12345",
  #     start_date: "2025-11-01T00:00:00Z",
  #     expiration_date: "2026-11-01T00:00:00Z"
  #   )
  class Client
    attr_reader :access_passes, :console

    # Creates a new DoorPasses client instance
    #
    # @param account_id [String] Your DoorPasses account ID (X-ACCT-ID)
    # @param shared_secret [String] Your DoorPasses shared secret for signing requests
    # @param options [Hash] Optional configuration
    # @option options [String] :base_url Base URL for the DoorPasses API (default: https://api.doorpasses.io)
    # @option options [Integer] :timeout Request timeout in milliseconds (default: 30000)
    #
    # @example
    #   # Using environment variables
    #   client = DoorPasses::Client.new(
    #     ENV['DOORPASSES_ACCOUNT_ID'],
    #     ENV['DOORPASSES_SHARED_SECRET']
    #   )
    #
    #   # With custom configuration
    #   client = DoorPasses::Client.new(
    #     account_id,
    #     shared_secret,
    #     base_url: 'https://api.doorpasses.io',
    #     timeout: 60000
    #   )
    def initialize(account_id, shared_secret, options = {})
      raise ArgumentError, 'account_id is required' if account_id.nil? || account_id.empty?
      raise ArgumentError, 'shared_secret is required' if shared_secret.nil? || shared_secret.empty?

      base_url = options[:base_url] || 'https://api.doorpasses.io'
      timeout = options[:timeout] || 30_000

      @http = HttpClient.new(account_id, shared_secret, base_url, timeout)
      @access_passes = Resources::AccessPasses.new(@http)
      @console = Resources::Console.new(@http)
    end

    # Health check to verify API connectivity
    #
    # @return [Hash] Health status information
    def health
      @http.get('/health')
    end
  end
end
