using System;
using Xunit;
using FluentAssertions;
using DoorPasses;
using DoorPasses.Models;

namespace DoorPasses.Tests
{
    public class DoorPassesClientTests
    {
        [Fact]
        public void Constructor_WithValidCredentials_ShouldCreateClient()
        {
            // Arrange & Act
            var client = new DoorPassesClient("test-account-id", "test-secret");

            // Assert
            client.Should().NotBeNull();
            client.AccessPasses.Should().NotBeNull();
            client.Console.Should().NotBeNull();
        }

        [Fact]
        public void Constructor_WithNullAccountId_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new DoorPassesClient(null!, "test-secret");

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*accountId*");
        }

        [Fact]
        public void Constructor_WithEmptyAccountId_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new DoorPassesClient("", "test-secret");

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*accountId*");
        }

        [Fact]
        public void Constructor_WithNullSharedSecret_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new DoorPassesClient("test-account-id", null!);

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*sharedSecret*");
        }

        [Fact]
        public void Constructor_WithEmptySharedSecret_ShouldThrowArgumentException()
        {
            // Arrange & Act
            Action act = () => new DoorPassesClient("test-account-id", "");

            // Assert
            act.Should().Throw<ArgumentException>()
                .WithMessage("*sharedSecret*");
        }

        [Fact]
        public void Constructor_WithCustomConfig_ShouldCreateClient()
        {
            // Arrange
            var config = new DoorPassesConfig
            {
                BaseUrl = "https://custom.api.doorpasses.io",
                Timeout = 60000
            };

            // Act
            var client = new DoorPassesClient("test-account-id", "test-secret", config);

            // Assert
            client.Should().NotBeNull();
        }

        [Fact]
        public void Dispose_ShouldNotThrow()
        {
            // Arrange
            var client = new DoorPassesClient("test-account-id", "test-secret");

            // Act
            Action act = () => client.Dispose();

            // Assert
            act.Should().NotThrow();
        }
    }
}
