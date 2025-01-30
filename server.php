<?php
require __DIR__.'/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use React\EventLoop\Factory;
use React\Socket\SecureServer;
use React\Socket\TcpServer;

$env = parse_ini_file(".env");

$loop = Factory::create();

$port = '8000';

$tcp = new TcpServer('127.0.0.1:'.$port, $loop);



$secureTcp = new SecureServer($tcp, $loop, [
    'local_cert' => $env["SSL_CERT"],
    'local_pk' => $env["SSL_KEY"],
    'verify_peer' => false,
    'verify_peer_name' => false,
    'allow_self_signed' => false
]);

$logFile = '/var/log/websocket/websocket.log';

function logMessage($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] " . $message . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

class ServerImpl implements MessageComponentInterface {
    protected $clients;
    protected $rooms = [15 => "Test"];
    protected $pseudos = [];
    private $mutex;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $res = [
            "room" => 0,
            "type" => "YOU ARE",
            "payload" => $conn->resourceId
        ];
        $conn->send(json_encode($res));
        logMessage("New connection! ({$conn->resourceId})");
    }

    public function onMessage(ConnectionInterface $conn, $raw) {
        logMessage(sprintf("New message from '%s': %s", $conn->resourceId, $raw));

        $msg = json_decode($raw, true);

        if ($msg["type"] == "CREATEROOM") {
            $room = random_int(10000, 99999);
            $this->rooms[$room] = [$conn->resourceId];

            logMessage(sprintf("Created room %s", $room));

            $pseudo = $msg["payload"];
            $this->pseudos[$conn->resourceId] = $pseudo;

            $res = [
                "room" => $room,
                "type" => "CREATED",
                "payload" => ""
            ];
            $conn->send(json_encode($res));
        }
        
        if ($msg["type"] == "NEW PLAYER") {
            $tmp = $this->rooms;
            $roomExists = array_key_exists($msg["room"], $tmp);

            if ($roomExists) {
                $this->rooms[$msg["room"]][] = $conn->resourceId;
                $targets = $this->rooms[$msg["room"]];
                logMessage(sprintf("Targets : %s", json_encode($targets))); /*TODO: DELETE THIS LOG*/
                $pseudo = $msg["payload"];
                $this->pseudos[$conn->resourceId] = $pseudo;

                foreach ($this->clients as $client) {
                    if (in_array($client->resourceId, $targets)) {
                        if ($conn !== $client) {
                            logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw));
                            $client->send($raw);
                        } else {
                            $res = [
                                "room" => $msg["room"],
                                "type" => "WELCOM PLAYER",
                                "payload" => ""
                            ];
                            $conn->send(json_encode($res));
                            logMessage(sprintf("New message sent to '%s': %s", $conn->resourceId, json_encode($res)));
                        }
                    }
                }
            } else {
                $res = [
                    "room" => $msg["room"],
                    "type" => "NOT ROOM",
                    "payload" => ""
                ];
                $conn->send(json_encode($res));
                logMessage(sprintf("New message sent to '%s': %s", $conn->resourceId, json_encode($res)));
            }
        }

        if ($msg["type"] == "READY") {
            $targets = $this->rooms[$msg["room"]];
            $players = $this->pseudos;
            logMessage(sprintf("Pseudos : %s", json_encode($players))); /*TODO: DELETE THIS LOG*/
            $res = [
                "room" => $msg["room"],
                "type" => "PLAYER READY",
                "payload" => sprintf("%s;%s", $msg["payload"], $players[$conn->resourceId])
            ];
            foreach ($this->clients as $client) {
                if (in_array($client->resourceId, $targets) && $conn !== $client) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)));
                    $client->send(json_encode($res));
                }
            }
        }

        if ($msg["type"] == "CLIENT GONE") {
            $tmp = $this->rooms;
            $id = array_search($conn->resourceId, $tmp[$msg["room"]]);
            unset($tmp[$msg["room"]][$id]);
            $this->rooms = $tmp;
            $players = $this->pseudos;
            $res = [
                "room" => $msg["room"],
                "type" => "CLIENT GONE",
                "payload" => $players[$conn->resourceId]
            ];
            foreach ($this->clients as $client) {
                $tmp = $this->rooms[$room];
                if ($conn !== $client && in_array($client->resourceId, $tmp)) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)));
                    $client->send(json_encode($res));
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        logMessage("Connection {$conn->resourceId} is gone");
        $room = $this->isMaster($conn->resourceId);
        $this->clients->detach($conn);
        
        if ($room !== -1) { // The leaving connection is the master of a room
            foreach ($this->clients as $client) {
                $tmp = $this->rooms[$room];
                if ($conn !== $client && in_array($client->resourceId, $tmp)) {
                    $res = [
                        "room" => $room,
                        "type" => "DELETED",
                        "payload" => ""
                    ];
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)));
                    $client->send(json_encode($res));
                }
            }
            unset($this->rooms[$room]);
        }
        logMessage(sprintf("Rooms : %s", json_encode($this->rooms))); /*TODO: DELETE THIS LOG*/
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        logMessage("An error occured on connection {$conn->resourceId}: {$e->getMessage()}");
        $conn->close();
    }

    public function isMaster($connId) {
        $tmp = $this->rooms;
        foreach ($tmp as $roomId => $room) {
            if ($connId === $room[0]) {
                return $roomId;
            }
        }
        return -1;
    }
}

$server = new IoServer(
    new HttpServer(
        new WsServer(
            new ServerImpl()
        )
    ),
    $secureTcp,
    $loop
);
echo "Server created on port $port\n\n";
$server->run();