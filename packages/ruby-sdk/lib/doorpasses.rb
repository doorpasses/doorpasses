# DoorPasses SDK - Official Ruby SDK for DoorPasses Digital Access Control Platform
#
# @example
#   require 'doorpasses'
#
#   client = DoorPasses::Client.new(account_id, shared_secret)
#   access_pass = client.access_passes.issue({...})

require_relative 'doorpasses/version'
require_relative 'doorpasses/errors'
require_relative 'doorpasses/auth'
require_relative 'doorpasses/http_client'
require_relative 'doorpasses/client'
require_relative 'doorpasses/resources/access_passes'
require_relative 'doorpasses/resources/console'

# Main DoorPasses module
module DoorPasses
  class << self
    # Convenience method to create a new DoorPasses client
    #
    # @param account_id [String] Your DoorPasses account ID
    # @param shared_secret [String] Your DoorPasses shared secret
    # @param options [Hash] Optional configuration
    # @return [DoorPasses::Client] A new client instance
    def new(account_id, shared_secret, options = {})
      Client.new(account_id, shared_secret, options)
    end
  end
end
