using System;
using System.Security.Cryptography;
using System.Text;

namespace DoorPasses.Auth
{
    /// <summary>
    /// Authentication helper for creating signatures and auth headers
    /// Uses SHA256(shared_secret + base64_encoded_payload).hexdigest()
    /// </summary>
    public static class AuthenticationHelper
    {
        /// <summary>
        /// Encodes a payload object to base64
        /// </summary>
        /// <param name="payload">The payload object to encode</param>
        /// <returns>Base64 encoded string of the JSON payload</returns>
        public static string EncodePayload(object? payload)
        {
            if (payload == null)
            {
                payload = new { id = "0" };
            }

            var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(payload);
            var bytes = Encoding.UTF8.GetBytes(jsonString);
            return Convert.ToBase64String(bytes);
        }

        /// <summary>
        /// Creates a signature for a payload using the shared secret
        /// </summary>
        /// <param name="sharedSecret">The shared secret key</param>
        /// <param name="encodedPayload">The base64 encoded payload</param>
        /// <returns>Hex string signature</returns>
        public static string CreateSignature(string sharedSecret, string encodedPayload)
        {
            var message = sharedSecret + encodedPayload;
            var messageBytes = Encoding.UTF8.GetBytes(message);

            using (var sha256 = SHA256.Create())
            {
                var hashBytes = sha256.ComputeHash(messageBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }
        }

        /// <summary>
        /// Verifies a signature matches the expected value
        /// </summary>
        /// <param name="sharedSecret">The shared secret key</param>
        /// <param name="encodedPayload">The base64 encoded payload</param>
        /// <param name="signature">The signature to verify</param>
        /// <returns>True if signature is valid</returns>
        public static bool VerifySignature(string sharedSecret, string encodedPayload, string signature)
        {
            var expectedSignature = CreateSignature(sharedSecret, encodedPayload);
            return string.Equals(expectedSignature, signature, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Creates authentication headers for API requests
        /// </summary>
        /// <param name="accountId">The account ID</param>
        /// <param name="sharedSecret">The shared secret</param>
        /// <param name="payload">Optional payload object</param>
        /// <returns>Tuple of headers dictionary and encoded payload</returns>
        public static (System.Collections.Generic.Dictionary<string, string> Headers, string EncodedPayload)
            CreateAuthHeaders(string accountId, string sharedSecret, object? payload = null)
        {
            var encodedPayload = EncodePayload(payload);
            var signature = CreateSignature(sharedSecret, encodedPayload);

            var headers = new System.Collections.Generic.Dictionary<string, string>
            {
                { "X-ACCT-ID", accountId },
                { "X-PAYLOAD-SIG", signature },
                { "Content-Type", "application/json" }
            };

            return (headers, encodedPayload);
        }
    }
}
