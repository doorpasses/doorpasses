<?php

namespace DoorPasses;

use DoorPasses\Resources\AccessPasses;
use DoorPasses\Resources\Console;

/**
 * Main DoorPasses SDK client
 *
 * @example
 * ```php
 * use DoorPasses\Client;
 *
 * $accountId = getenv('DOORPASSES_ACCOUNT_ID');
 * $sharedSecret = getenv('DOORPASSES_SHARED_SECRET');
 *
 * $client = new Client($accountId, $sharedSecret);
 *
 * // Issue an access pass
 * $accessPass = $client->accessPasses->issue([
 *     'cardTemplateId' => 'template_123',
 *     'fullName' => 'John Doe',
 *     'email' => 'john@example.com',
 *     'cardNumber' => '12345',
 *     'startDate' => '2025-11-01T00:00:00Z',
 *     'expirationDate' => '2026-11-01T00:00:00Z'
 * ]);
 * ```
 */
class Client
{
    private HttpClient $http;

    /**
     * Access passes resource for managing access passes
     */
    public AccessPasses $accessPasses;

    /**
     * Console resource for managing card templates (Enterprise only)
     */
    public Console $console;

    /**
     * Creates a new DoorPasses client instance
     *
     * @param string $accountId Your DoorPasses account ID (X-ACCT-ID)
     * @param string $sharedSecret Your DoorPasses shared secret for signing requests
     * @param array $options Optional configuration
     *                       - baseUrl: Base URL for the DoorPasses API (default: https://api.doorpasses.io)
     *                       - timeout: Request timeout in seconds (default: 30)
     *
     * @throws \InvalidArgumentException If accountId or sharedSecret is empty
     *
     * @example
     * ```php
     * // Using environment variables
     * $client = new Client(
     *     getenv('DOORPASSES_ACCOUNT_ID'),
     *     getenv('DOORPASSES_SHARED_SECRET')
     * );
     *
     * // With custom configuration
     * $client = new Client(
     *     $accountId,
     *     $sharedSecret,
     *     [
     *         'baseUrl' => 'https://api.doorpasses.io',
     *         'timeout' => 60
     *     ]
     * );
     * ```
     */
    public function __construct(string $accountId, string $sharedSecret, array $options = [])
    {
        if (empty($accountId) || empty($sharedSecret)) {
            throw new \InvalidArgumentException('accountId and sharedSecret are required');
        }

        $baseUrl = $options['baseUrl'] ?? 'https://api.doorpasses.io';
        $timeout = $options['timeout'] ?? 30;

        $this->http = new HttpClient($accountId, $sharedSecret, $baseUrl, $timeout);
        $this->accessPasses = new AccessPasses($this->http);
        $this->console = new Console($this->http);
    }

    /**
     * Health check to verify API connectivity
     *
     * @return mixed Health status information
     * @throws \Exception
     */
    public function health()
    {
        return $this->http->get('/health');
    }
}
