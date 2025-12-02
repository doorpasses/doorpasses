module DoorPasses
  module Resources
    # AccessPasses resource for managing access passes
    class AccessPasses
      # Initialize the AccessPasses resource
      #
      # @param http_client [HttpClient] The HTTP client instance
      def initialize(http_client)
        @http = http_client
      end

      # Issue a new access pass
      #
      # @param params [Hash] Parameters for issuing the access pass
      # @option params [String] :card_template_id Unique identifier for the card template to use
      # @option params [String] :employee_id Unique identifier for the employee
      # @option params [String, nil] :tag_id Tag identifier (7 bytes, 14 chars hex)
      # @option params [String, nil] :site_code Site code from H10301 format (< 255)
      # @option params [String] :card_number Card number from H10301 format (< 65,535)
      # @option params [String, nil] :file_data Up to 64 chars of hex data
      # @option params [String] :full_name Full name of the access pass owner
      # @option params [String, nil] :email Email address
      # @option params [String, nil] :phone_number Contact phone number
      # @option params [String, nil] :classification Employment classification
      # @option params [String] :start_date ISO8601 timestamp when active
      # @option params [String] :expiration_date ISO8601 timestamp when expires
      # @option params [String, nil] :employee_photo Base64 encoded image
      # @option params [String, nil] :title Job title or department
      # @option params [String, nil] :member_id Loyalty/membership ID
      # @option params [String, nil] :membership_status Membership status
      # @option params [Boolean, nil] :is_pass_ready_to_transact Pass ready for NFC
      # @option params [Hash, nil] :tile_data Data for hotel tile display
      # @option params [Hash, nil] :reservations Data for hotel reservation
      # @option params [Hash, nil] :metadata Custom JSON object for additional data
      # @return [Hash] The created access pass with installation URL
      def issue(params)
        @http.post('/v1/access-passes', params)
      end

      # List access passes with optional filtering
      #
      # @param params [Hash, nil] Optional parameters for filtering
      # @option params [String, nil] :template_id Filter by card template ID
      # @option params [String, nil] :state Filter by state (active, suspended, unlink, deleted)
      # @return [Array<Hash>] Array of access passes
      def list(params = nil)
        sig_payload = {}

        if params
          sig_payload[:template_id] = params[:template_id] if params[:template_id]
          sig_payload[:state] = params[:state] if params[:state]
        end

        @http.get('/v1/access-passes', sig_payload.empty? ? nil : sig_payload)
      end

      # Update an access pass
      #
      # @param params [Hash] Parameters for updating the access pass
      # @option params [String] :card_id Unique identifier of the access pass to update
      # @option params [String, nil] :employee_id Updated employee identifier
      # @option params [String, nil] :full_name Updated full name
      # @option params [String, nil] :classification Updated employment classification
      # @option params [String, nil] :expiration_date Updated expiration date
      # @option params [String, nil] :employee_photo Updated base64 encoded image
      # @option params [String, nil] :title Updated job title
      # @option params [String, nil] :file_data Updated hex data
      # @option params [Boolean, nil] :is_pass_ready_to_transact Pass ready for NFC
      # @option params [Hash, nil] :tile_data Updated hotel tile data
      # @option params [Hash, nil] :reservations Updated hotel reservation data
      # @option params [Hash, nil] :metadata Updated custom metadata
      # @return [Hash] The updated access pass
      def update(params)
        card_id = params.delete(:card_id)
        raise ArgumentError, 'card_id is required' unless card_id

        @http.patch("/v1/access-passes/#{card_id}", params)
      end

      # Suspend an access pass
      #
      # @param card_id [String] The ID of the access pass to suspend
      # @return [Hash] Success response
      def suspend(card_id)
        raise ArgumentError, 'card_id is required' unless card_id

        @http.post("/v1/access-passes/#{card_id}/suspend")
      end

      # Resume a suspended access pass
      #
      # @param card_id [String] The ID of the access pass to resume
      # @return [Hash] Success response
      def resume(card_id)
        raise ArgumentError, 'card_id is required' unless card_id

        @http.post("/v1/access-passes/#{card_id}/resume")
      end

      # Unlink an access pass from the user's device
      #
      # @param card_id [String] The ID of the access pass to unlink
      # @return [Hash] Success response
      def unlink(card_id)
        raise ArgumentError, 'card_id is required' unless card_id

        @http.post("/v1/access-passes/#{card_id}/unlink")
      end

      # Delete an access pass permanently
      #
      # @param card_id [String] The ID of the access pass to delete
      # @return [Hash] Success response
      def delete(card_id)
        raise ArgumentError, 'card_id is required' unless card_id

        @http.post("/v1/access-passes/#{card_id}/delete")
      end
    end
  end
end
