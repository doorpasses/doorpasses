using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace DoorPasses.Models
{
    /// <summary>
    /// Access Pass model
    /// </summary>
    public class AccessPass
    {
        [JsonProperty("id")]
        public string Id { get; set; } = string.Empty;

        [JsonProperty("cardTemplateId")]
        public string CardTemplateId { get; set; } = string.Empty;

        [JsonProperty("employeeId")]
        public string? EmployeeId { get; set; }

        [JsonProperty("tagId")]
        public string? TagId { get; set; }

        [JsonProperty("siteCode")]
        public string? SiteCode { get; set; }

        [JsonProperty("cardNumber")]
        public string? CardNumber { get; set; }

        [JsonProperty("fileData")]
        public string? FileData { get; set; }

        [JsonProperty("fullName")]
        public string FullName { get; set; } = string.Empty;

        [JsonProperty("email")]
        public string? Email { get; set; }

        [JsonProperty("phoneNumber")]
        public string? PhoneNumber { get; set; }

        [JsonProperty("classification")]
        public string? Classification { get; set; }

        [JsonProperty("startDate")]
        public string StartDate { get; set; } = string.Empty;

        [JsonProperty("expirationDate")]
        public string ExpirationDate { get; set; } = string.Empty;

        [JsonProperty("employeePhoto")]
        public string? EmployeePhoto { get; set; }

        [JsonProperty("title")]
        public string? Title { get; set; }

        [JsonProperty("state")]
        public string State { get; set; } = "active";

        [JsonProperty("url")]
        public string? Url { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }

        [JsonProperty("createdAt")]
        public string CreatedAt { get; set; } = string.Empty;

        [JsonProperty("updatedAt")]
        public string UpdatedAt { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request model for issuing an access pass
    /// </summary>
    public class IssueAccessPassRequest
    {
        [JsonProperty("cardTemplateId")]
        public string CardTemplateId { get; set; } = string.Empty;

        [JsonProperty("employeeId")]
        public string? EmployeeId { get; set; }

        [JsonProperty("tagId")]
        public string? TagId { get; set; }

        [JsonProperty("siteCode")]
        public string? SiteCode { get; set; }

        [JsonProperty("cardNumber")]
        public string CardNumber { get; set; } = string.Empty;

        [JsonProperty("fileData")]
        public string? FileData { get; set; }

        [JsonProperty("fullName")]
        public string FullName { get; set; } = string.Empty;

        [JsonProperty("email")]
        public string? Email { get; set; }

        [JsonProperty("phoneNumber")]
        public string? PhoneNumber { get; set; }

        [JsonProperty("classification")]
        public string? Classification { get; set; }

        [JsonProperty("startDate")]
        public string StartDate { get; set; } = string.Empty;

        [JsonProperty("expirationDate")]
        public string ExpirationDate { get; set; } = string.Empty;

        [JsonProperty("employeePhoto")]
        public string? EmployeePhoto { get; set; }

        [JsonProperty("title")]
        public string? Title { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Request model for updating an access pass
    /// </summary>
    public class UpdateAccessPassRequest
    {
        [JsonProperty("employeeId")]
        public string? EmployeeId { get; set; }

        [JsonProperty("fullName")]
        public string? FullName { get; set; }

        [JsonProperty("classification")]
        public string? Classification { get; set; }

        [JsonProperty("expirationDate")]
        public string? ExpirationDate { get; set; }

        [JsonProperty("employeePhoto")]
        public string? EmployeePhoto { get; set; }

        [JsonProperty("title")]
        public string? Title { get; set; }

        [JsonProperty("fileData")]
        public string? FileData { get; set; }

        [JsonProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }
    }

    /// <summary>
    /// Request model for listing access passes
    /// </summary>
    public class ListAccessPassesRequest
    {
        [JsonProperty("templateId")]
        public string? TemplateId { get; set; }

        [JsonProperty("state")]
        public string? State { get; set; }
    }
}
