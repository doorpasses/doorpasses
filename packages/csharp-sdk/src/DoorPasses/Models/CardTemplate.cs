using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace DoorPasses.Models
{
    /// <summary>
    /// Design configuration for card templates
    /// </summary>
    public class CardTemplateDesign
    {
        [JsonProperty("backgroundColor")]
        public string? BackgroundColor { get; set; }

        [JsonProperty("labelColor")]
        public string? LabelColor { get; set; }

        [JsonProperty("labelSecondaryColor")]
        public string? LabelSecondaryColor { get; set; }

        [JsonProperty("backgroundImage")]
        public string? BackgroundImage { get; set; }

        [JsonProperty("logoImage")]
        public string? LogoImage { get; set; }

        [JsonProperty("iconImage")]
        public string? IconImage { get; set; }
    }

    /// <summary>
    /// Support information for card templates
    /// </summary>
    public class SupportInfo
    {
        [JsonProperty("supportUrl")]
        public string? SupportUrl { get; set; }

        [JsonProperty("supportPhoneNumber")]
        public string? SupportPhoneNumber { get; set; }

        [JsonProperty("supportEmail")]
        public string? SupportEmail { get; set; }

        [JsonProperty("privacyPolicyUrl")]
        public string? PrivacyPolicyUrl { get; set; }

        [JsonProperty("termsAndConditionsUrl")]
        public string? TermsAndConditionsUrl { get; set; }
    }

    /// <summary>
    /// Card Template model
    /// </summary>
    public class CardTemplate
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("platform")]
        public string Platform { get; set; } = string.Empty;

        [JsonProperty("useCase")]
        public string UseCase { get; set; } = string.Empty;

        [JsonProperty("protocol")]
        public string Protocol { get; set; } = string.Empty;

        [JsonProperty("allowOnMultipleDevices")]
        public bool? AllowOnMultipleDevices { get; set; }

        [JsonProperty("watchCount")]
        public int? WatchCount { get; set; }

        [JsonProperty("iphoneCount")]
        public int? IphoneCount { get; set; }

        [JsonProperty("design")]
        public CardTemplateDesign? Design { get; set; }

        [JsonProperty("supportInfo")]
        public SupportInfo? SupportInfo { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }

        [JsonProperty("createdAt")]
        public string CreatedAt { get; set; } = string.Empty;

        [JsonProperty("updatedAt")]
        public string UpdatedAt { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request model for creating a card template
    /// </summary>
    public class CreateCardTemplateRequest
    {
        [JsonProperty("name")]
        public string Name { get; set; } = string.Empty;

        [JsonProperty("platform")]
        public string Platform { get; set; } = string.Empty;

        [JsonProperty("useCase")]
        public string UseCase { get; set; } = string.Empty;

        [JsonProperty("protocol")]
        public string Protocol { get; set; } = string.Empty;

        [JsonProperty("allowOnMultipleDevices")]
        public bool? AllowOnMultipleDevices { get; set; }

        [JsonProperty("watchCount")]
        public int? WatchCount { get; set; }

        [JsonProperty("iphoneCount")]
        public int? IphoneCount { get; set; }

        [JsonProperty("design")]
        public CardTemplateDesign? Design { get; set; }

        [JsonProperty("supportInfo")]
        public SupportInfo? SupportInfo { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Request model for updating a card template
    /// </summary>
    public class UpdateCardTemplateRequest
    {
        [JsonProperty("name")]
        public string? Name { get; set; }

        [JsonProperty("allowOnMultipleDevices")]
        public bool? AllowOnMultipleDevices { get; set; }

        [JsonProperty("watchCount")]
        public int? WatchCount { get; set; }

        [JsonProperty("iphoneCount")]
        public int? IphoneCount { get; set; }

        [JsonProperty("supportInfo")]
        public SupportInfo? SupportInfo { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Event log entry model
    /// </summary>
    public class EventLogEntry
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("type")]
        public string Type { get; set; } = string.Empty;

        [JsonProperty("timestamp")]
        public string Timestamp { get; set; } = string.Empty;

        [JsonProperty("userId")]
        public string? UserId { get; set; }

        [JsonProperty("device")]
        public string? Device { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Event log filters
    /// </summary>
    public class EventLogFilters
    {
        [JsonProperty("device")]
        public string? Device { get; set; }

        [JsonProperty("startDate")]
        public string? StartDate { get; set; }

        [JsonProperty("endDate")]
        public string? EndDate { get; set; }

        [JsonProperty("eventType")]
        public string? EventType { get; set; }
    }
}
