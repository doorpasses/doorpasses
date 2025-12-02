using Newtonsoft.Json;

namespace DoorPasses.Models
{
    /// <summary>
    /// Common response wrapper
    /// </summary>
    /// <typeparam name="T">Type of data in response</typeparam>
    public class DoorPassesResponse<T>
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("data")]
        public T Data { get; set; } = default!;

        [JsonProperty("error")]
        public string? Error { get; set; }

        [JsonProperty("message")]
        public string? Message { get; set; }
    }

    /// <summary>
    /// Success response for operations without data
    /// </summary>
    public class SuccessResponse
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// Configuration options for the DoorPasses client
    /// </summary>
    public class DoorPassesConfig
    {
        /// <summary>
        /// Account ID (X-ACCT-ID header)
        /// </summary>
        public string AccountId { get; set; } = string.Empty;

        /// <summary>
        /// Shared secret for signing requests
        /// </summary>
        public string SharedSecret { get; set; } = string.Empty;

        /// <summary>
        /// Base URL for the DoorPasses API
        /// </summary>
        public string BaseUrl { get; set; } = "https://api.doorpasses.io";

        /// <summary>
        /// Request timeout in milliseconds
        /// </summary>
        public int Timeout { get; set; } = 30000;
    }
}
