<?php

namespace DoorPasses\Tests;

use PHPUnit\Framework\TestCase;
use DoorPasses\Auth;

class AuthTest extends TestCase
{
    public function testEncodePayload(): void
    {
        $payload = ['id' => '123', 'name' => 'test'];
        $encoded = Auth::encodePayload($payload);

        $this->assertIsString($encoded);
        $this->assertEquals($payload, json_decode(base64_decode($encoded), true));
    }

    public function testCreateSignature(): void
    {
        $sharedSecret = 'test_secret';
        $encodedPayload = 'dGVzdF9wYXlsb2Fk'; // base64 encoded "test_payload"

        $signature = Auth::createSignature($sharedSecret, $encodedPayload);

        $this->assertIsString($signature);
        $this->assertEquals(64, strlen($signature)); // SHA256 produces 64 char hex string
    }

    public function testVerifySignature(): void
    {
        $sharedSecret = 'test_secret';
        $encodedPayload = 'dGVzdF9wYXlsb2Fk';
        $signature = Auth::createSignature($sharedSecret, $encodedPayload);

        $this->assertTrue(Auth::verifySignature($sharedSecret, $encodedPayload, $signature));
        $this->assertFalse(Auth::verifySignature($sharedSecret, $encodedPayload, 'invalid_signature'));
    }

    public function testCreateAuthHeaders(): void
    {
        $accountId = 'test_account';
        $sharedSecret = 'test_secret';
        $payload = ['id' => '123'];

        $headers = Auth::createAuthHeaders($accountId, $sharedSecret, $payload);

        $this->assertArrayHasKey('X-ACCT-ID', $headers);
        $this->assertArrayHasKey('X-PAYLOAD-SIG', $headers);
        $this->assertArrayHasKey('Content-Type', $headers);
        $this->assertEquals($accountId, $headers['X-ACCT-ID']);
        $this->assertEquals('application/json', $headers['Content-Type']);
    }

    public function testCreateAuthHeadersWithoutPayload(): void
    {
        $accountId = 'test_account';
        $sharedSecret = 'test_secret';

        $headers = Auth::createAuthHeaders($accountId, $sharedSecret);

        $this->assertArrayHasKey('X-ACCT-ID', $headers);
        $this->assertArrayHasKey('X-PAYLOAD-SIG', $headers);
    }

    public function testCreateGetAuthHeaders(): void
    {
        $accountId = 'test_account';
        $sharedSecret = 'test_secret';
        $sigPayload = ['id' => '123'];

        $result = Auth::createGetAuthHeaders($accountId, $sharedSecret, $sigPayload);

        $this->assertArrayHasKey('headers', $result);
        $this->assertArrayHasKey('sigPayload', $result);
        $this->assertArrayHasKey('X-ACCT-ID', $result['headers']);
        $this->assertArrayHasKey('X-PAYLOAD-SIG', $result['headers']);
        $this->assertIsString($result['sigPayload']);
    }
}
