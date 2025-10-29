<?php

namespace App\Websocket;

use Ratchet\ConnectionInterface;

class RoomComponent
{
    public static function create(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["pseudo"]) || empty($datas["pseudo"])) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }

        $master = $from->token;

        $roomsId = [];
        foreach ($rooms as $key => $val) {
            if ($val["master"] === $master) {
                return ['error' => 'Already master of a room'];
            }
            $roomsId[] = $key;
        }

        $room = random_int(0, 999999);
        while (in_array($room, $roomsId)) {
            $room = random_int(0, 999999);
        }

        return [
            $room => [
                "master" => $master,
                $master => $datas["pseudo"]
            ]
        ];
    }

    public static function delete(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }

        $room = $datas["room"];
        if (!isset($rooms[$room])) {
            return ['error' => 'The room doesn\'t exist'];
        }

        if ($rooms[$room]["master"] !== $from->token) {
            return ['error' => 'Only the master of a room can delete it'];
        }

        unset($rooms[$room]);
        return $rooms;
    }

    public static function join(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }
        if (!isset($datas["pseudo"]) || empty($datas["pseudo"])) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }

        $room = $datas["room"];
        if (!isset($rooms[$room])) {
            return ['error' => 'The room doesn\'t exist'];
        }

        $playerToken = $from->token;
        if ($rooms[$room]["master"] === $playerToken) {
            return ['error' => 'Master cannot join the room as player'];
        }

        if (in_array($playerToken, array_keys($rooms[$room]))) {
            return ['error' => 'Already joined the room'];
        }

        foreach($rooms[$room] as $key => $player) {
            if ($key === "master" || $key === $rooms[$room]["master"]) {
                continue;
            }

            if ($player["pseudo"] === $datas["pseudo"]) {
                return ['error' => 'Pseudo already taken'];
            }
        }

        $rooms[$room][$playerToken] = [
            "pseudo" => $datas["pseudo"],
            "ready" => false
        ];
        return $rooms;
    }

    public static function ready(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }
        if (!isset($datas["pseudo"]) || empty($datas["pseudo"])) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }
        if (!isset($datas["team"]) || empty($datas["team"])) {
            return ['error' => 'Missing mandatory \'team\' field.'];
        }
        if (!isset($datas["color"]) || empty($datas["color"])) {
            return ['error' => 'Missing mandatory \'color\' field.'];
        }

        $room = $datas["room"];
        if (!isset($rooms[$room])) {
            return ['error' => 'The room doesn\'t exist'];
        }

        $playerToken = $from->token;
        if ($rooms[$room]["master"] === $playerToken) {
            return ['error' => 'Master cannot mark as ready in the room as player'];
        }

        if (!in_array($playerToken, array_keys($rooms[$room]))) {
            return ['error' => 'Not in the room'];
        }

        $rooms[$room][$playerToken] = [
            "pseudo" => $datas["pseudo"],
            "team" => $datas["team"],
            "color" => $datas["color"],
            "ready" => true
        ];
        return $rooms;
    }

    public static function kickOut(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }

        if (!isset($datas["player"]) || empty($datas["player"])) {
            return ['error' => 'Missing mandatory \'player\' field.'];
        }

        $room = $datas["room"];
        if (!isset($rooms[$room])) {
            return ['error' => 'The room doesn\'t exist'];
        }
        $room = $rooms[$room];

        if ($room["master"] !== $from->token) {
            return ['error' => 'Only master of a room can kick out from it'];
        }

        $token = "";
        foreach ($room as $key => $value) {
            if ($key === "master" || $key === $room["master"]) {
                continue;
            }

            if ($value["pseudo"] === $datas["player"]) {
                $token = $key;
                break;
            }
        }

        if (empty($token)) {
            return ['error' => 'This player is not in this room'];
        }

        unset($room[$token]);
        $rooms[$datas["room"]] = $room;
        return [
            "rooms" => $rooms,
            "token" => $token
        ];
    }
}