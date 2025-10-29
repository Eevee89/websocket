<?php

namespace App\Websocket;

use Ratchet\ConnectionInterface;

class RoundComponent
{
    public static function ready(ConnectionInterface $from, array $datas, array $rooms): array
    {
        return [];
    }
}