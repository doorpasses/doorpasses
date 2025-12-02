using System;
using Xunit;
using FluentAssertions;
using DoorPasses.Auth;

namespace DoorPasses.Tests
{
    public class AuthenticationHelperTests
    {
        [Fact]
        public void EncodePayload_ShouldEncodeObjectToBase64()
        {
            // Arrange
            var payload = new { id = "test123" };

            // Act
            var result = AuthenticationHelper.EncodePayload(payload);

            // Assert
            result.Should().NotBeNullOrEmpty();
            var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(result));
            decoded.Should().Contain("test123");
        }

        [Fact]
        public void EncodePayload_WithNullPayload_ShouldUseDefaultPayload()
        {
            // Arrange & Act
            var result = AuthenticationHelper.EncodePayload(null);

            // Assert
            result.Should().NotBeNullOrEmpty();
            var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(result));
            decoded.Should().Contain("\"id\":\"0\"");
        }

        [Fact]
        public void CreateSignature_ShouldGenerateValidSignature()
        {
            // Arrange
            var sharedSecret = "test-secret";
            var encodedPayload = "dGVzdA=="; // "test" in base64

            // Act
            var signature = AuthenticationHelper.CreateSignature(sharedSecret, encodedPayload);

            // Assert
            signature.Should().NotBeNullOrEmpty();
            signature.Should().HaveLength(64); // SHA256 hex string length
            signature.Should().MatchRegex("^[a-f0-9]{64}$");
        }

        [Fact]
        public void VerifySignature_WithValidSignature_ShouldReturnTrue()
        {
            // Arrange
            var sharedSecret = "test-secret";
            var encodedPayload = "dGVzdA==";
            var signature = AuthenticationHelper.CreateSignature(sharedSecret, encodedPayload);

            // Act
            var isValid = AuthenticationHelper.VerifySignature(sharedSecret, encodedPayload, signature);

            // Assert
            isValid.Should().BeTrue();
        }

        [Fact]
        public void VerifySignature_WithInvalidSignature_ShouldReturnFalse()
        {
            // Arrange
            var sharedSecret = "test-secret";
            var encodedPayload = "dGVzdA==";
            var invalidSignature = "invalid-signature";

            // Act
            var isValid = AuthenticationHelper.VerifySignature(sharedSecret, encodedPayload, invalidSignature);

            // Assert
            isValid.Should().BeFalse();
        }

        [Fact]
        public void CreateAuthHeaders_ShouldIncludeRequiredHeaders()
        {
            // Arrange
            var accountId = "test-account-id";
            var sharedSecret = "test-secret";
            var payload = new { id = "test" };

            // Act
            var (headers, encodedPayload) = AuthenticationHelper.CreateAuthHeaders(accountId, sharedSecret, payload);

            // Assert
            headers.Should().ContainKey("X-ACCT-ID");
            headers.Should().ContainKey("X-PAYLOAD-SIG");
            headers.Should().ContainKey("Content-Type");
            headers["X-ACCT-ID"].Should().Be(accountId);
            headers["Content-Type"].Should().Be("application/json");
            encodedPayload.Should().NotBeNullOrEmpty();
        }
    }
}
