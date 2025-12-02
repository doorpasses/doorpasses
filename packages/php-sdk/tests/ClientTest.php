<?php

namespace DoorPasses\Tests;

use PHPUnit\Framework\TestCase;
use DoorPasses\Client;

class ClientTest extends TestCase
{
    public function testConstructorThrowsExceptionForEmptyAccountId(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('accountId and sharedSecret are required');

        new Client('', 'shared_secret');
    }

    public function testConstructorThrowsExceptionForEmptySharedSecret(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('accountId and sharedSecret are required');

        new Client('account_id', '');
    }

    public function testConstructorSuccessWithValidCredentials(): void
    {
        $client = new Client('account_id', 'shared_secret');

        $this->assertInstanceOf(Client::class, $client);
        $this->assertInstanceOf(\DoorPasses\Resources\AccessPasses::class, $client->accessPasses);
        $this->assertInstanceOf(\DoorPasses\Resources\Console::class, $client->console);
    }

    public function testConstructorWithCustomOptions(): void
    {
        $client = new Client('account_id', 'shared_secret', [
            'baseUrl' => 'https://custom.api.url',
            'timeout' => 60,
        ]);

        $this->assertInstanceOf(Client::class, $client);
    }
}
