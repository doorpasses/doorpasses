require 'faraday'
require 'json'
require_relative 'auth'
require_relative 'errors'

module DoorPasses
  # HTTP client for making authenticated requests to the DoorPasses API
  class HttpClient
    attr_reader :account_id, :shared_secret, :base_url, :timeout

    # Initialize a new HTTP client
    #
    # @param account_id [String] Your DoorPasses account ID
    # @param shared_secret [String] Your DoorPasses shared secret
    # @param base_url [String] Base URL for the DoorPasses API
    # @param timeout [Integer] Request timeout in seconds
    def initialize(account_id, shared_secret, base_url, timeout)
      @account_id = account_id
      @shared_secret = shared_secret
      @base_url = base_url
      @timeout = timeout / 1000.0 # Convert milliseconds to seconds

      @connection = Faraday.new(url: base_url) do |f|
        f.options.timeout = @timeout
        f.options.open_timeout = @timeout
        f.adapter Faraday.default_adapter
      end
    end

    # Make a GET request
    #
    # @param path [String] API endpoint path
    # @param sig_payload [Hash, nil] Optional signature payload for authentication
    # @return [Hash, Array] Parsed response body
    def get(path, sig_payload = nil)
      headers, _encoded = Auth.create_get_auth_headers(@account_id, @shared_secret, sig_payload)
      request(:get, path, nil, headers)
    end

    # Make a POST request
    #
    # @param path [String] API endpoint path
    # @param body [Hash, nil] Request body
    # @return [Hash, Array] Parsed response body
    def post(path, body = nil)
      headers = Auth.create_auth_headers(@account_id, @shared_secret, body)
      request(:post, path, body, headers)
    end

    # Make a PATCH request
    #
    # @param path [String] API endpoint path
    # @param body [Hash, nil] Request body
    # @return [Hash, Array] Parsed response body
    def patch(path, body = nil)
      headers = Auth.create_auth_headers(@account_id, @shared_secret, body)
      request(:patch, path, body, headers)
    end

    # Make a DELETE request
    #
    # @param path [String] API endpoint path
    # @return [Hash, Array] Parsed response body
    def delete(path)
      headers = Auth.create_auth_headers(@account_id, @shared_secret)
      request(:delete, path, nil, headers)
    end

    private

    # Make a request to the API
    #
    # @param method [Symbol] HTTP method (:get, :post, :patch, :delete)
    # @param path [String] API endpoint path
    # @param body [Hash, nil] Request body
    # @param headers [Hash] Request headers
    # @return [Hash, Array] Parsed response body
    # @raise [DoorPassesError] If the request fails
    def request(method, path, body, headers)
      response = @connection.send(method) do |req|
        req.url path
        req.headers.merge!(headers)
        req.body = JSON.generate(body) if body && !body.empty?
      end

      handle_response(response)
    rescue Faraday::TimeoutError => e
      raise DoorPassesError, "Request timeout: #{e.message}"
    rescue Faraday::ConnectionFailed => e
      raise DoorPassesError, "Connection failed: #{e.message}"
    rescue Faraday::Error => e
      raise DoorPassesError, "Request failed: #{e.message}"
    end

    # Handle the API response
    #
    # @param response [Faraday::Response] The HTTP response
    # @return [Hash, Array] Parsed response body
    # @raise [DoorPassesError] If the response indicates an error
    def handle_response(response)
      case response.status
      when 200..299
        parse_response(response)
      when 400
        raise BadRequestError, error_message(response)
      when 401
        raise UnauthorizedError, error_message(response)
      when 403
        raise ForbiddenError, error_message(response)
      when 404
        raise NotFoundError, error_message(response)
      when 429
        raise RateLimitError, error_message(response)
      when 500..599
        raise ServerError, error_message(response)
      else
        raise DoorPassesError, "Unexpected status code: #{response.status}"
      end
    end

    # Parse the response body
    #
    # @param response [Faraday::Response] The HTTP response
    # @return [Hash, Array] Parsed response body
    def parse_response(response)
      return {} if response.body.nil? || response.body.empty?

      JSON.parse(response.body)
    rescue JSON::ParserError => e
      raise DoorPassesError, "Failed to parse response: #{e.message}"
    end

    # Extract error message from response
    #
    # @param response [Faraday::Response] The HTTP response
    # @return [String] Error message
    def error_message(response)
      body = JSON.parse(response.body)
      body['error'] || body['message'] || "HTTP #{response.status}"
    rescue JSON::ParserError, StandardError
      "HTTP #{response.status}"
    end
  end
end
