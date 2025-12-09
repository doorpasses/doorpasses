using System.Collections.Generic;
using System.Threading.Tasks;
using DoorPasses.Http;
using DoorPasses.Models;

namespace DoorPasses.Resources
{
    /// <summary>
    /// AccessPasses resource for managing access passes
    /// </summary>
    public class AccessPasses
    {
        private readonly DoorPassesHttpClient _http;

        /// <summary>
        /// Creates a new AccessPasses resource instance
        /// </summary>
        /// <param name="httpClient">HTTP client instance</param>
        public AccessPasses(DoorPassesHttpClient httpClient)
        {
            _http = httpClient;
        }

        /// <summary>
        /// Issue a new access pass
        /// </summary>
        /// <param name="request">Parameters for issuing the access pass</param>
        /// <returns>The created access pass with installation URL</returns>
        public async Task<AccessPass> IssueAsync(IssueAccessPassRequest request)
        {
            return await _http.PostAsync<AccessPass>("/v1/access-passes", request);
        }

        /// <summary>
        /// List access passes with optional filtering
        /// </summary>
        /// <param name="request">Optional parameters for filtering</param>
        /// <returns>Array of access passes</returns>
        public async Task<List<AccessPass>> ListAsync(ListAccessPassesRequest? request = null)
        {
            var sigPayload = new Dictionary<string, object>();

            if (request != null)
            {
                if (!string.IsNullOrEmpty(request.TemplateId))
                {
                    sigPayload["template_id"] = request.TemplateId;
                }
                if (!string.IsNullOrEmpty(request.State))
                {
                    sigPayload["state"] = request.State;
                }
            }

            return await _http.GetAsync<List<AccessPass>>("/v1/access-passes", sigPayload.Count > 0 ? sigPayload : null);
        }

        /// <summary>
        /// Update an access pass
        /// </summary>
        /// <param name="accessPassId">The ID of the access pass to update</param>
        /// <param name="request">Parameters for updating the access pass</param>
        /// <returns>The updated access pass</returns>
        public async Task<AccessPass> UpdateAsync(string accessPassId, UpdateAccessPassRequest request)
        {
            return await _http.PatchAsync<AccessPass>($"/v1/access-passes/{accessPassId}", request);
        }

        /// <summary>
        /// Suspend an access pass
        /// </summary>
        /// <param name="accessPassId">The ID of the access pass to suspend</param>
        /// <returns>Success response</returns>
        public async Task<SuccessResponse> SuspendAsync(string accessPassId)
        {
            return await _http.PostAsync<SuccessResponse>($"/v1/access-passes/{accessPassId}/suspend");
        }

        /// <summary>
        /// Resume a suspended access pass
        /// </summary>
        /// <param name="accessPassId">The ID of the access pass to resume</param>
        /// <returns>Success response</returns>
        public async Task<SuccessResponse> ResumeAsync(string accessPassId)
        {
            return await _http.PostAsync<SuccessResponse>($"/v1/access-passes/{accessPassId}/resume");
        }

        /// <summary>
        /// Unlink an access pass from the user's device
        /// </summary>
        /// <param name="accessPassId">The ID of the access pass to unlink</param>
        /// <returns>Success response</returns>
        public async Task<SuccessResponse> UnlinkAsync(string accessPassId)
        {
            return await _http.PostAsync<SuccessResponse>($"/v1/access-passes/{accessPassId}/unlink");
        }

        /// <summary>
        /// Delete an access pass permanently
        /// </summary>
        /// <param name="accessPassId">The ID of the access pass to delete</param>
        /// <returns>Success response</returns>
        public async Task<SuccessResponse> DeleteAsync(string accessPassId)
        {
            return await _http.PostAsync<SuccessResponse>($"/v1/access-passes/{accessPassId}/delete");
        }
    }
}
