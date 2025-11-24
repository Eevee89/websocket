<?php

namespace App\Websocket;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use SplObjectStorage;

use App\Websocket\ResponseComponent as Response;
use App\Websocket\RoomComponent;

use App\Entity\Player;
use App\Entity\Room;

class MasterComponent implements MessageComponentInterface
{
    /** @var Room[] $rooms */
    private array $rooms = [];
    private array $activeConnections = [];
    protected SplObjectStorage $clients;

    public function __construct()
    {
        $this->clients = new SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        $ttl = count($this->clients);
        echo "Nouvelle connexion ({$conn->resourceId}). Total: {$ttl} connectés\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        $data = json_decode($msg, true);

        if (json_last_error() !== JSON_ERROR_NONE || !isset($data['route']) || !isset($data['datas'])) {
            $from->send(Response::error('', 'Invalid message format. Expecting JSON with "route" field.'));
            return;
        }

        $route = $data["route"];
        $datas = $data["datas"];
        if ($route === "login") {
            $this->login($from, $datas);
            return;
        }

        if (!in_array($from, array_values($this->activeConnections)) || null === $from->token) {
            $from->send(Response::error($route, 'Not logged in'));
            return;
        }

        match ($route) {
            'dump/rooms' => $this->dumpRooms($from),
            'logout' => $this->logout($from),
            'room/create' => $this->createRoom($from, $datas),
            'room/delete' => $this->deleteRoom($from, $datas),
            'room/join' => $this->joinRoom($from, $datas),
            'room/ready' => $this->readyRoom($from, $datas),
            'room/kick-out' => $this->kickOutRoom($from, $datas),
            'round/ready' => $this->broadcast($from, $route, $datas),
            default => $from->send(Response::error($route, 'Unknown route'))
        };
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "Une erreur est survenue: {$e->getMessage()}\n";
        $conn->close();
        $this->clients->detach($conn);
    }

    private function login(ConnectionInterface $from, array $datas)
    {
        try {
            if (!isset($datas["token"]) || empty($datas["token"])) {
                $from->send(Response::error('login', 'Missing mandatory \'token\' field.'));
            }

            $token = $datas["token"];
            if (isset($this->activeConnections[$token])) {
                $oldConn = $this->activeConnections[$token];
                $oldConn->send(Response::error('login', 'New session open, forced log out'));
                $oldConn->close(); 
                $this->clients->detach($oldConn);
                echo "Reconnexion: Ancienne connexion pour {$token} fermée.\n";
            }

            $this->activeConnections[$token] = $from;
            
            $from->token = $token;
            echo "Reconnexion: Nouvelle connexion pour {$from->token} ouverte.\n";
            $from->send(Response::success('login'));
        } catch (\Throwable $e) {
            $trace = json_encode($e->getTrace());
            echo "Une erreur est survenue: {$trace}\n";
            $from->send(Response::error('login', $e->getMessage(), $e->getTrace()));
        }
    }

    private function logout(ConnectionInterface $from): void
    {
        if (isset($from->token) && isset($this->activeConnections[$from->token])) {
            unset($this->activeConnections[$from->token]); 
            echo "Utilisateur {$from->token} déconnecté.\n";
        }

        $rooms = array_keys($this->rooms);
        foreach ($rooms as $room) {
            $result = RoomComponent::delete($from, ["room" => $room], $this->rooms);
            if (isset($result["error"])) {
                continue;
            }

            $room = $this->rooms[$room];
            $this->rooms = $result;

            foreach($this->clients as $client) {
                if (in_array($client->token, $room->getPlayersToken())) {
                    $client->send(Response::success('room/delete'));
                }
            }
        }

        echo json_encode($this->rooms) . "\n";
        $from->close();
        $this->clients->detach($from);
    }

    private function createRoom(ConnectionInterface $from, array $datas): void 
    {
        $result = RoomComponent::create($from, $datas, $this->rooms);
        if (isset($result["error"])) {
            $from->send(Response::error('room/create', $result['error']));
            return;
        }

        $room = array_keys($result)[0];
        $this->rooms[$room] = $result[$room];

        echo json_encode($this->rooms) . "\n";
        $from->send(Response::success('room/create', ['room' => $room]));
        return;
    }

    private function deleteRoom(ConnectionInterface $from, array $datas): void 
    {
        $result = RoomComponent::delete($from, $datas, $this->rooms);
        if (isset($result["error"])) {
            $from->send(Response::error('room/delete', $result['error']));
            return;
        }

        $room = $this->rooms[$datas["room"]];
        $this->rooms = $result;

        foreach($this->clients as $client) {
            if (in_array($client->token, $room->getPlayersToken())) {
                $client->send(Response::success('room/delete'));
            }
        }

        echo json_encode($this->rooms) . "\n";
        return;
    }

    private function joinRoom(ConnectionInterface $from, array $datas): void 
    {
        $result = RoomComponent::join($from, $datas, $this->rooms);
        if (isset($result["error"])) {
            $from->send(Response::error('room/join', $result['error']));
            return;
        }

        $this->rooms = $result;

        echo json_encode($this->rooms) . "\n";
        $masterToken = $this->rooms[$datas["room"]]->getMaster()->getToken();
        $master = $this->activeConnections[$masterToken];
        $master->send(Response::success('room/join', [
            "pseudo" => $datas["pseudo"],
            "team" => "N/A",
            "color" => "#AAAAAA"
        ]));
        $from->send(Response::success('room/join'));
        return;
    }

    private function readyRoom(ConnectionInterface $from, array $datas): void
    {
        $result = RoomComponent::ready($from, $datas, $this->rooms);
        if (isset($result["error"])) {
            $from->send(Response::error('room/ready', $result['error']));
            return;
        }

        $this->rooms = $result;

        echo json_encode($this->rooms) . "\n";
        $masterToken = $this->rooms[$datas["room"]]->getMaster()->getToken();
        $master = $this->activeConnections[$masterToken];
        $master->send(Response::success('room/ready', [
            "pseudo" => $datas["pseudo"],
            "team" => $datas["team"],
            "color" => $datas["color"]
        ]));
        $from->send(Response::success('room/ready'));
        return;
    }

    private function kickOutRoom(ConnectionInterface $from, array $datas): void 
    {
        $result = RoomComponent::kickOut($from, $datas, $this->rooms);
        if (isset($result["error"])) {
            $from->send(Response::error('room/kick-out', $result['error']));
            return;
        }

        $this->rooms = $result["rooms"];

        $conn = $this->activeConnections[$result["token"]];
        $conn->send(Response::error('room/kick-out', "You've been kicked out"));
        $from->send(Response::success('room/kick-out', [
            "player" => $datas["player"]
        ]));

        echo json_encode($this->rooms) . "\n";
        return;
    }

    private function dumpRooms($from): void
    {
        $from->send(Response::success('dump/rooms', $this->rooms));
        return;
    }

    private function broadcast($from, $route, $datas): void
    {
        if (!isset($datas["room"]) || empty($datas["room"])) {
            $from->send(Response::error($route, 'Missing mandatory \'room\' field.'));
            return;
        }

        $room = $datas["room"];
        if (!isset($this->rooms[$room])) {
            $from->send(Response::error($route, 'The room doesn\'t exist'));
            return;
        }
        unset($datas['room']);
        $room = $this->rooms[$room];
        $datas["isMaster"] = $room->isMaster($from->token);

        if (!$datas["isMaster"] && !isset($datas["pseudo"]) || empty($datas["pseudo"])) {
            $from->send(Response::error($route, 'Missing mandatory \'pseudo\' field.'));
            return;
        }

        foreach ($this->clients as $client) {
            if ($client->token !== $from->token && in_array($client->token, $room->getPlayersToken())) {
                $client->send(Response::success($route, $datas));
            }
        }
        $from->send(Response::success($route, [], "Succesfull broadcast"));
    }
}