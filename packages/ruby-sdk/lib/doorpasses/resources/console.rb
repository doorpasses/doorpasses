module DoorPasses
  module Resources
    # Console resource for managing card templates (Enterprise only)
    class Console
      # Initialize the Console resource
      #
      # @param http_client [HttpClient] The HTTP client instance
      def initialize(http_client)
        @http = http_client
      end

      # Create a new card template (Enterprise only)
      #
      # @param params [Hash] Parameters for creating the card template
      # @option params [String] :name Display name for the template
      # @option params [String] :platform Must be 'apple' or 'google'
      # @option params [String] :use_case Must be 'employee_badge' or 'hotel'
      # @option params [String] :protocol Must be 'desfire' or 'seos'
      # @option params [Boolean, nil] :allow_on_multiple_devices Allow on multiple devices
      # @option params [Integer, nil] :watch_count Number of watches (1-5)
      # @option params [Integer, nil] :iphone_count Number of iPhones (1-5)
      # @option params [Hash, nil] :design Template design settings
      # @option params [Hash, nil] :support_info Support information
      # @option params [Hash, nil] :metadata Custom metadata
      # @return [Hash] The created card template
      def create_template(params)
        @http.post('/v1/console/templates', params)
      end

      # Update an existing card template (Enterprise only)
      #
      # @param params [Hash] Parameters for updating the card template
      # @option params [String] :card_template_id The template ID to update
      # @option params [String, nil] :name Updated display name
      # @option params [Boolean, nil] :allow_on_multiple_devices Allow on multiple devices
      # @option params [Integer, nil] :watch_count Number of watches (1-5)
      # @option params [Integer, nil] :iphone_count Number of iPhones (1-5)
      # @option params [Hash, nil] :support_info Updated support information
      # @option params [Hash, nil] :metadata Updated custom metadata
      # @return [Hash] The updated card template
      def update_template(params)
        template_id = params.delete(:card_template_id)
        raise ArgumentError, 'card_template_id is required' unless template_id

        @http.patch("/v1/console/templates/#{template_id}", params)
      end

      # Read card template information (Enterprise only)
      #
      # @param card_template_id [String] Unique identifier for the card template
      # @return [Hash] The card template details
      def read_template(card_template_id)
        raise ArgumentError, 'card_template_id is required' unless card_template_id

        sig_payload = { template_id: card_template_id }
        @http.get("/v1/console/templates/#{card_template_id}", sig_payload)
      end

      # Read event log for a card template (Enterprise only)
      #
      # @param params [Hash] Parameters for reading event log
      # @option params [String] :card_template_id Template ID to query
      # @option params [Hash, nil] :filters Optional filters for events
      # @return [Array<Hash>] Array of event log entries
      def event_log(params)
        template_id = params[:card_template_id]
        raise ArgumentError, 'card_template_id is required' unless template_id

        sig_payload = { template_id: template_id }
        sig_payload[:filters] = params[:filters] if params[:filters]

        @http.get("/v1/console/templates/#{template_id}/events", sig_payload)
      end

      # Get iOS provisioning identifiers (Enterprise only)
      #
      # @param params [Hash] Parameters for iOS preflight
      # @option params [String] :card_template_id The card template ID
      # @option params [String] :access_pass_ex_id The access pass ex_id
      # @return [Hash] iOS provisioning identifiers
      def ios_preflight(params)
        template_id = params[:card_template_id]
        pass_id = params[:access_pass_ex_id]

        raise ArgumentError, 'card_template_id is required' unless template_id
        raise ArgumentError, 'access_pass_ex_id is required' unless pass_id

        sig_payload = {
          card_template_id: template_id,
          access_pass_ex_id: pass_id
        }

        @http.get('/v1/console/ios-preflight', sig_payload)
      end
    end
  end
end
