<?php

namespace DoorPasses;

use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;

/**
 * HTTP client for making authenticated requests to the DoorPasses API
 */
class HttpClient
{
    private GuzzleClient $client;
    private string $accountId;
    private string $sharedSecret;

    /**
     * Creates a new HTTP client instance
     *
     * @param string $accountId The account ID
     * @param string $sharedSecret The shared secret
     * @param string $baseUrl The base URL for the API
     * @param int $timeout Request timeout in seconds
     */
    public function __construct(string $accountId, string $sharedSecret, string $baseUrl, int $timeout)
    {
        $this->accountId = $accountId;
        $this->sharedSecret = $sharedSecret;

        $this->client = new GuzzleClient([
            'base_uri' => $baseUrl,
            'timeout' => $timeout,
            'headers' => [
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    /**
     * Makes a GET request
     *
     * @param string $url The endpoint URL
     * @param array|null $sigPayload Optional signature payload
     * @return mixed The response data
     * @throws \Exception
     */
    public function get(string $url, ?array $sigPayload = null)
    {
        try {
            $authData = Auth::createGetAuthHeaders($this->accountId, $this->sharedSecret, $sigPayload);

            $response = $this->client->get($url, [
                'headers' => $authData['headers'],
                'query' => [
                    'sig_payload' => $authData['sigPayload'],
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);
            return $data['data'] ?? $data;
        } catch (RequestException $e) {
            $this->handleException($e);
        } catch (GuzzleException $e) {
            throw new \Exception('Request error: ' . $e->getMessage());
        }
    }

    /**
     * Makes a POST request
     *
     * @param string $url The endpoint URL
     * @param array|null $data The request body data
     * @return mixed The response data
     * @throws \Exception
     */
    public function post(string $url, ?array $data = null)
    {
        try {
            $headers = Auth::createAuthHeaders($this->accountId, $this->sharedSecret, $data);

            $response = $this->client->post($url, [
                'headers' => $headers,
                'json' => $data,
            ]);

            $responseData = json_decode($response->getBody()->getContents(), true);
            return $responseData['data'] ?? $responseData;
        } catch (RequestException $e) {
            $this->handleException($e);
        } catch (GuzzleException $e) {
            throw new \Exception('Request error: ' . $e->getMessage());
        }
    }

    /**
     * Makes a PATCH request
     *
     * @param string $url The endpoint URL
     * @param array|null $data The request body data
     * @return mixed The response data
     * @throws \Exception
     */
    public function patch(string $url, ?array $data = null)
    {
        try {
            $headers = Auth::createAuthHeaders($this->accountId, $this->sharedSecret, $data);

            $response = $this->client->patch($url, [
                'headers' => $headers,
                'json' => $data,
            ]);

            $responseData = json_decode($response->getBody()->getContents(), true);
            return $responseData['data'] ?? $responseData;
        } catch (RequestException $e) {
            $this->handleException($e);
        } catch (GuzzleException $e) {
            throw new \Exception('Request error: ' . $e->getMessage());
        }
    }

    /**
     * Makes a DELETE request
     *
     * @param string $url The endpoint URL
     * @return mixed The response data
     * @throws \Exception
     */
    public function delete(string $url)
    {
        try {
            $headers = Auth::createAuthHeaders($this->accountId, $this->sharedSecret);

            $response = $this->client->delete($url, [
                'headers' => $headers,
            ]);

            $responseData = json_decode($response->getBody()->getContents(), true);
            return $responseData['data'] ?? $responseData;
        } catch (RequestException $e) {
            $this->handleException($e);
        } catch (GuzzleException $e) {
            throw new \Exception('Request error: ' . $e->getMessage());
        }
    }

    /**
     * Handles exceptions from HTTP requests
     *
     * @param RequestException $e The exception
     * @throws \Exception
     */
    private function handleException(RequestException $e): void
    {
        if ($e->hasResponse()) {
            $response = $e->getResponse();
            $body = json_decode($response->getBody()->getContents(), true);
            $errorMessage = $body['error'] ?? $body['message'] ?? $e->getMessage();
            throw new \Exception('DoorPasses API Error (' . $response->getStatusCode() . '): ' . $errorMessage);
        }

        throw new \Exception('No response received from DoorPasses API');
    }
}
