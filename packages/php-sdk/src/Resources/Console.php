<?php

namespace DoorPasses\Resources;

use DoorPasses\HttpClient;

/**
 * Console resource for managing card templates (Enterprise only)
 */
class Console
{
    private HttpClient $http;

    /**
     * Creates a new Console resource instance
     *
     * @param HttpClient $httpClient The HTTP client
     */
    public function __construct(HttpClient $httpClient)
    {
        $this->http = $httpClient;
    }

    /**
     * Create a new card template
     *
     * @param array $params Parameters for creating the card template
     *                      - name (required): Template name
     *                      - platform (required): 'apple' or 'google'
     *                      - useCase (required): 'employee_badge' or 'hotel'
     *                      - protocol (required for Apple): 'desfire' or 'seos'
     *                      - allowOnMultipleDevices: Allow on multiple devices
     *                      - watchCount: Number of watches allowed
     *                      - iphoneCount: Number of iPhones allowed
     *                      - design: Design configuration object
     *                      - supportInfo: Support information object
     *                      - metadata: Custom JSON object
     * @return array The created card template
     * @throws \Exception
     */
    public function createTemplate(array $params): array
    {
        return $this->http->post('/v1/console/card-templates', $params);
    }

    /**
     * Read a card template
     *
     * @param string $cardTemplateId The ID of the card template to read
     * @return array The card template
     * @throws \Exception
     */
    public function readTemplate(string $cardTemplateId): array
    {
        return $this->http->get(
            "/v1/console/card-templates/{$cardTemplateId}",
            ['id' => $cardTemplateId]
        );
    }

    /**
     * Update a card template
     *
     * @param array $params Parameters for updating the card template
     *                      - cardTemplateId (required): The template ID
     *                      - name: Updated name
     *                      - allowOnMultipleDevices: Updated multi-device setting
     *                      - watchCount: Updated watch count
     *                      - iphoneCount: Updated iPhone count
     *                      - supportInfo: Updated support info
     *                      - metadata: Updated metadata
     * @return array The updated card template
     * @throws \Exception
     */
    public function updateTemplate(array $params): array
    {
        $cardTemplateId = $params['cardTemplateId'] ?? null;
        if (!$cardTemplateId) {
            throw new \InvalidArgumentException('cardTemplateId is required');
        }

        unset($params['cardTemplateId']);
        return $this->http->patch("/v1/console/card-templates/{$cardTemplateId}", $params);
    }

    /**
     * Publish a card template
     *
     * @param string $cardTemplateId The ID of the card template to publish
     * @return array Success response
     * @throws \Exception
     */
    public function publishTemplate(string $cardTemplateId): array
    {
        return $this->http->post("/v1/console/card-templates/{$cardTemplateId}/publish");
    }

    /**
     * Read event logs for a card template
     *
     * @param array $params Parameters for filtering event logs
     *                      - cardTemplateId (required): The template ID
     *                      - filters: Optional filters object
     *                          - device: 'mobile' or 'watch'
     *                          - startDate: ISO8601 timestamp
     *                          - endDate: ISO8601 timestamp
     *                          - eventType: 'issue', 'install', 'update', 'suspend', 'resume', or 'unlink'
     * @return array Array of event log entries
     * @throws \Exception
     */
    public function eventLog(array $params): array
    {
        $cardTemplateId = $params['cardTemplateId'] ?? null;
        if (!$cardTemplateId) {
            throw new \InvalidArgumentException('cardTemplateId is required');
        }

        $sigPayload = ['id' => $cardTemplateId];
        $filters = $params['filters'] ?? null;

        if ($filters) {
            if (isset($filters['device'])) {
                $sigPayload['device'] = $filters['device'];
            }
            if (isset($filters['startDate'])) {
                $sigPayload['start_date'] = $filters['startDate'];
            }
            if (isset($filters['endDate'])) {
                $sigPayload['end_date'] = $filters['endDate'];
            }
            if (isset($filters['eventType'])) {
                $sigPayload['event_type'] = $filters['eventType'];
            }
        }

        return $this->http->get("/v1/console/card-templates/{$cardTemplateId}/logs", $sigPayload);
    }

    /**
     * iOS Preflight - Get provisioning identifiers for iOS
     * (Enterprise only)
     *
     * @param array $params Parameters
     *                      - cardTemplateId (required): The template ID
     *                      - accessPassExId (required): The access pass ex_id
     * @return array Provisioning identifiers
     * @throws \Exception
     */
    public function iosPreflight(array $params): array
    {
        $cardTemplateId = $params['cardTemplateId'] ?? null;
        $accessPassExId = $params['accessPassExId'] ?? null;

        if (!$cardTemplateId || !$accessPassExId) {
            throw new \InvalidArgumentException('cardTemplateId and accessPassExId are required');
        }

        return $this->http->get(
            "/v1/console/card-templates/{$cardTemplateId}/ios-preflight/{$accessPassExId}",
            ['id' => $accessPassExId]
        );
    }
}
