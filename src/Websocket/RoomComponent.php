<?php

namespace App\Websocket;

use Ratchet\ConnectionInterface;
use App\Entity\Player;
use App\Entity\Room;

class RoomComponent
{
    /**
     * @param ConnectionInterface $from
     * @param array $datas
     * @param Room[] $rooms
     */
    public static function create(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["pseudo"]) || empty($datas["pseudo"])) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }

        $masterToken = $from->token;

        $roomsId = [];
        foreach ($rooms as $key => $room) {
            if ($room->isMaster($masterToken)) {
                return ['error' => 'Already master of a room'];
            }
            $roomsId[] = $key;
        }

        $roomId = random_int(0, 999999);
        while (in_array($roomId, $roomsId)) {
            $roomId = random_int(0, 999999);
        }
        $master = new Player($masterToken, $datas["pseudo"]);
        return [
            $roomId => new Room($roomId, $master)
        ];
    }

    /**
     * @param ConnectionInterface $from
     * @param array $datas
     * @param Room[] $rooms
     */
    public static function delete(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }

        $room = $datas["room"];
        if (!isset($rooms[$room])) {
            return ['error' => 'The room doesn\'t exist'];
        }

        if (!$rooms[$room]->isMaster($from->token)) {
            return ['error' => 'Only the master of a room can delete it'];
        }

        unset($rooms[$room]);
        return $rooms;
    }

    /**
     * @param ConnectionInterface $from
     * @param array $datas
     * @param Room[] $rooms
     */
    public static function join(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }
        if (!isset($datas["pseudo"]) || empty($datas["pseudo"])) {
            return ['error' => 'Missing mandatory \'pseudo\' field.'];
        }

        $roomId = $datas["room"];
        if (!isset($rooms[$roomId])) {
            return ['error' => 'The room doesn\'t exist'];
        }

        $playerToken = $from->token;
        $room = $rooms[$roomId];
        if ($room->isMaster($playerToken)) {
            return ['error' => 'Master cannot join the room as player'];
        }

        $player = new Player($playerToken, $datas["pseudo"]);
        $res = $room->addPlayer($player);
        if (is_string($res)) {
            return ['error' => $res];
        }

        $rooms[$roomId] = $res;
        return $rooms;
    }

    /**
     * @param ConnectionInterface $from
     * @param array $datas
     * @param Room[] $rooms
     */
    public static function ready(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }
        if (!isset($datas["team"])) {
            return ['error' => 'Missing mandatory \'team\' field.'];
        }
        if (!isset($datas["color"]) || empty($datas["color"])) {
            return ['error' => 'Missing mandatory \'color\' field.'];
        }

        $roomId = $datas["room"];
        if (!isset($rooms[$roomId])) {
            return ['error' => 'The room doesn\'t exist'];
        }

        $room = $rooms[$roomId];
        $playerToken = $from->token;
        if ($room->isMaster($playerToken)) {
            return ['error' => 'Master cannot mark as ready in the room as player'];
        }

        if (!$room->hasPlayer($playerToken)) {
            return ['error' => 'Not in the room'];
        }

        $player = $room->getPlayer($playerToken);
        $player->setTeam($datas["team"] ?? "");
        $player->setColor($datas["color"]);
        $player->setReady(true);

        $room->setPlayer($player);
        $rooms[$roomId] = $room;
        return $rooms;
    }

    /**
     * @param ConnectionInterface $from
     * @param array $datas
     * @param Room[] $rooms
     */
    public static function kickOut(ConnectionInterface $from, array $datas, array $rooms): array
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            return ['error' => 'Missing mandatory \'room\' field.'];
        }
        if (!isset($datas["player"]) || empty($datas["player"])) {
            return ['error' => 'Missing mandatory \'player\' field.'];
        }

        $roomId = $datas["room"];
        if (!isset($rooms[$roomId])) {
            return ['error' => 'The room doesn\'t exist'];
        }
        $room = $rooms[$roomId];

        if (!$room->isMaster($from->token)) {
            return ['error' => 'Only master of a room can kick out from it'];
        }

        $token = $room->removePlayerWithPseudo($datas["player"]);
        if ("" === $token) {
            return ['error' => 'This player is not in the room'];
        }
        $room = $room->removePlayerWithToken($token);

        $rooms[$roomId] = $room;
        return [
            "rooms" => $rooms,
            "token" => $token
        ];
    }
}