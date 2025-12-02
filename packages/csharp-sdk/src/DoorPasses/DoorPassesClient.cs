using System;
using System.Threading.Tasks;
using DoorPasses.Http;
using DoorPasses.Models;
using DoorPasses.Resources;

namespace DoorPasses
{
    /// <summary>
    /// Main DoorPasses SDK client for interacting with the DoorPasses API
    /// </summary>
    /// <example>
    /// <code>
    /// var accountId = Environment.GetEnvironmentVariable("DOORPASSES_ACCOUNT_ID");
    /// var sharedSecret = Environment.GetEnvironmentVariable("DOORPASSES_SHARED_SECRET");
    ///
    /// var client = new DoorPassesClient(accountId, sharedSecret);
    ///
    /// // Issue an access pass
    /// var accessPass = await client.AccessPasses.IssueAsync(new IssueAccessPassRequest
    /// {
    ///     CardTemplateId = "template_123",
    ///     FullName = "John Doe",
    ///     Email = "john@example.com",
    ///     CardNumber = "12345",
    ///     StartDate = DateTime.UtcNow.ToString("o"),
    ///     ExpirationDate = DateTime.UtcNow.AddYears(1).ToString("o")
    /// });
    /// </code>
    /// </example>
    public class DoorPassesClient : IDisposable
    {
        private readonly DoorPassesHttpClient _http;
        private bool _disposed = false;

        /// <summary>
        /// Access passes resource for managing access passes
        /// </summary>
        public AccessPasses AccessPasses { get; }

        /// <summary>
        /// Console resource for managing card templates (Enterprise only)
        /// </summary>
        public Resources.Console Console { get; }

        /// <summary>
        /// Creates a new DoorPasses client instance
        /// </summary>
        /// <param name="accountId">Your DoorPasses account ID (X-ACCT-ID)</param>
        /// <param name="sharedSecret">Your DoorPasses shared secret for signing requests</param>
        /// <param name="config">Optional configuration</param>
        /// <exception cref="ArgumentException">Thrown when accountId or sharedSecret is null or empty</exception>
        /// <example>
        /// <code>
        /// // Using environment variables
        /// var client = new DoorPassesClient(
        ///     Environment.GetEnvironmentVariable("DOORPASSES_ACCOUNT_ID"),
        ///     Environment.GetEnvironmentVariable("DOORPASSES_SHARED_SECRET")
        /// );
        ///
        /// // With custom configuration
        /// var client = new DoorPassesClient(
        ///     accountId,
        ///     sharedSecret,
        ///     new DoorPassesConfig
        ///     {
        ///         BaseUrl = "https://api.doorpasses.io",
        ///         Timeout = 60000
        ///     }
        /// );
        /// </code>
        /// </example>
        public DoorPassesClient(string accountId, string sharedSecret, DoorPassesConfig? config = null)
        {
            if (string.IsNullOrWhiteSpace(accountId))
                throw new ArgumentException("accountId is required", nameof(accountId));

            if (string.IsNullOrWhiteSpace(sharedSecret))
                throw new ArgumentException("sharedSecret is required", nameof(sharedSecret));

            var baseUrl = config?.BaseUrl ?? "https://api.doorpasses.io";
            var timeout = config?.Timeout ?? 30000;

            _http = new DoorPassesHttpClient(accountId, sharedSecret, baseUrl, timeout);
            AccessPasses = new AccessPasses(_http);
            Console = new Resources.Console(_http);
        }

        /// <summary>
        /// Health check to verify API connectivity
        /// </summary>
        /// <returns>Health status information</returns>
        public async Task<object> HealthAsync()
        {
            return await _http.GetAsync<object>("/health");
        }

        /// <summary>
        /// Disposes the DoorPasses client and releases resources
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Disposes the DoorPasses client and releases resources
        /// </summary>
        /// <param name="disposing">Whether to dispose managed resources</param>
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _http?.Dispose();
                }
                _disposed = true;
            }
        }
    }
}
