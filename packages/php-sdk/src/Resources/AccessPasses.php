<?php

namespace DoorPasses\Resources;

use DoorPasses\HttpClient;

/**
 * AccessPasses resource for managing access passes
 */
class AccessPasses
{
    private HttpClient $http;

    /**
     * Creates a new AccessPasses resource instance
     *
     * @param HttpClient $httpClient The HTTP client
     */
    public function __construct(HttpClient $httpClient)
    {
        $this->http = $httpClient;
    }

    /**
     * Issue a new access pass
     *
     * @param array $params Parameters for issuing the access pass
     *                      - cardTemplateId (required): Card template ID
     *                      - fullName (required): Full name of the pass owner
     *                      - email: Email address
     *                      - phoneNumber: Phone number
     *                      - cardNumber (required): Card number
     *                      - startDate (required): ISO8601 timestamp
     *                      - expirationDate (required): ISO8601 timestamp
     *                      - classification: Employment classification
     *                      - title: Job title
     *                      - employeePhoto: Base64 encoded image
     *                      - employeeId: Employee ID
     *                      - tagId: Tag identifier (if enabled)
     *                      - siteCode: Site code for H10301 format
     *                      - fileData: Hexadecimal data for proprietary formats
     *                      - memberId: Loyalty/membership ID (hotel use case)
     *                      - membershipStatus: Membership status (hotel use case)
     *                      - isPassReadyToTransact: Pass ready for NFC (hotel use case)
     *                      - tileData: Hotel tile display data
     *                      - reservations: Hotel reservation data
     *                      - metadata: Custom JSON object
     * @return array The created access pass with installation URL
     * @throws \Exception
     */
    public function issue(array $params): array
    {
        return $this->http->post('/v1/access-passes', $params);
    }

    /**
     * List access passes with optional filtering
     *
     * @param array|null $params Optional parameters for filtering
     *                           - templateId: Filter by card template ID
     *                           - state: Filter by state (active, suspended, unlink, deleted)
     * @return array Array of access passes
     * @throws \Exception
     */
    public function list(?array $params = null): array
    {
        $sigPayload = [];

        if (isset($params['templateId'])) {
            $sigPayload['template_id'] = $params['templateId'];
        }
        if (isset($params['state'])) {
            $sigPayload['state'] = $params['state'];
        }

        return $this->http->get('/v1/access-passes', $sigPayload);
    }

    /**
     * Update an access pass
     *
     * @param array $params Parameters for updating the access pass
     *                      - accessPassId (required): The ID of the access pass
     *                      - fullName: Updated full name
     *                      - classification: Updated classification
     *                      - expirationDate: Updated expiration date
     *                      - employeePhoto: Updated employee photo
     *                      - title: Updated job title
     *                      - employeeId: Updated employee ID
     *                      - fileData: Updated file data (Android)
     *                      - isPassReadyToTransact: Updated NFC ready status
     *                      - tileData: Updated tile data
     *                      - reservations: Updated reservations
     *                      - metadata: Updated metadata
     * @return array The updated access pass
     * @throws \Exception
     */
    public function update(array $params): array
    {
        $accessPassId = $params['accessPassId'] ?? null;
        if (!$accessPassId) {
            throw new \InvalidArgumentException('accessPassId is required');
        }

        unset($params['accessPassId']);
        return $this->http->patch("/v1/access-passes/{$accessPassId}", $params);
    }

    /**
     * Suspend an access pass
     *
     * @param string $accessPassId The ID of the access pass to suspend
     * @return array Success response
     * @throws \Exception
     */
    public function suspend(string $accessPassId): array
    {
        return $this->http->post("/v1/access-passes/{$accessPassId}/suspend");
    }

    /**
     * Resume a suspended access pass
     *
     * @param string $accessPassId The ID of the access pass to resume
     * @return array Success response
     * @throws \Exception
     */
    public function resume(string $accessPassId): array
    {
        return $this->http->post("/v1/access-passes/{$accessPassId}/resume");
    }

    /**
     * Unlink an access pass from the user's device
     *
     * @param string $accessPassId The ID of the access pass to unlink
     * @return array Success response
     * @throws \Exception
     */
    public function unlink(string $accessPassId): array
    {
        return $this->http->post("/v1/access-passes/{$accessPassId}/unlink");
    }

    /**
     * Delete an access pass permanently
     *
     * @param string $accessPassId The ID of the access pass to delete
     * @return array Success response
     * @throws \Exception
     */
    public function delete(string $accessPassId): array
    {
        return $this->http->post("/v1/access-passes/{$accessPassId}/delete");
    }
}
