using System.Collections.Generic;
using System.Threading.Tasks;
using DoorPasses.Http;
using DoorPasses.Models;

namespace DoorPasses.Resources
{
    /// <summary>
    /// Console resource for managing card templates (Enterprise only)
    /// </summary>
    public class Console
    {
        private readonly DoorPassesHttpClient _http;

        /// <summary>
        /// Creates a new Console resource instance
        /// </summary>
        /// <param name="httpClient">HTTP client instance</param>
        public Console(DoorPassesHttpClient httpClient)
        {
            _http = httpClient;
        }

        /// <summary>
        /// Create a new card template
        /// </summary>
        /// <param name="request">Parameters for creating the card template</param>
        /// <returns>The created card template</returns>
        /// <remarks>Enterprise tier required</remarks>
        public async Task<CardTemplate> CreateTemplateAsync(CreateCardTemplateRequest request)
        {
            return await _http.PostAsync<CardTemplate>("/v1/console/card-templates", request);
        }

        /// <summary>
        /// Read a card template
        /// </summary>
        /// <param name="cardTemplateId">The ID of the card template to read</param>
        /// <returns>The card template</returns>
        /// <remarks>Enterprise tier required</remarks>
        public async Task<CardTemplate> ReadTemplateAsync(string cardTemplateId)
        {
            var sigPayload = new Dictionary<string, object>
            {
                { "id", cardTemplateId }
            };

            return await _http.GetAsync<CardTemplate>(
                $"/v1/console/card-templates/{cardTemplateId}",
                sigPayload
            );
        }

        /// <summary>
        /// Update a card template
        /// </summary>
        /// <param name="cardTemplateId">The ID of the card template to update</param>
        /// <param name="request">Parameters for updating the card template</param>
        /// <returns>The updated card template</returns>
        /// <remarks>Enterprise tier required</remarks>
        public async Task<CardTemplate> UpdateTemplateAsync(string cardTemplateId, UpdateCardTemplateRequest request)
        {
            return await _http.PatchAsync<CardTemplate>(
                $"/v1/console/card-templates/{cardTemplateId}",
                request
            );
        }

        /// <summary>
        /// Publish a card template
        /// </summary>
        /// <param name="cardTemplateId">The ID of the card template to publish</param>
        /// <returns>Success response</returns>
        /// <remarks>Enterprise tier required</remarks>
        public async Task<SuccessResponse> PublishTemplateAsync(string cardTemplateId)
        {
            return await _http.PostAsync<SuccessResponse>($"/v1/console/card-templates/{cardTemplateId}/publish");
        }

        /// <summary>
        /// Read event logs for a card template
        /// </summary>
        /// <param name="cardTemplateId">The card template ID to get logs for</param>
        /// <param name="filters">Optional filters for the event logs</param>
        /// <returns>Array of event log entries</returns>
        /// <remarks>Enterprise tier required</remarks>
        public async Task<List<EventLogEntry>> EventLogAsync(string cardTemplateId, EventLogFilters? filters = null)
        {
            var sigPayload = new Dictionary<string, object>
            {
                { "id", cardTemplateId }
            };

            if (filters != null)
            {
                if (!string.IsNullOrEmpty(filters.Device))
                    sigPayload["device"] = filters.Device;
                if (!string.IsNullOrEmpty(filters.StartDate))
                    sigPayload["start_date"] = filters.StartDate;
                if (!string.IsNullOrEmpty(filters.EndDate))
                    sigPayload["end_date"] = filters.EndDate;
                if (!string.IsNullOrEmpty(filters.EventType))
                    sigPayload["event_type"] = filters.EventType;
            }

            return await _http.GetAsync<List<EventLogEntry>>(
                $"/v1/console/card-templates/{cardTemplateId}/logs",
                sigPayload
            );
        }
    }
}
