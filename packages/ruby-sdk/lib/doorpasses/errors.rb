module DoorPasses
  # Base error class for DoorPasses SDK
  class DoorPassesError < StandardError; end

  # Error raised when a request is invalid (400)
  class BadRequestError < DoorPassesError; end

  # Error raised when authentication fails (401)
  class UnauthorizedError < DoorPassesError; end

  # Error raised when access is forbidden (403)
  class ForbiddenError < DoorPassesError; end

  # Error raised when a resource is not found (404)
  class NotFoundError < DoorPassesError; end

  # Error raised when rate limit is exceeded (429)
  class RateLimitError < DoorPassesError; end

  # Error raised when server encounters an error (500+)
  class ServerError < DoorPassesError; end
end
