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

$pseudos = [];

$rooms = [];

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

function isMaster($connId) {
    foreach ($rooms as $roomId => $room) {
        if ($connId === $room[0]) {
            return $roomId;
        }
    }
    return -1;
}

class ServerImpl implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        logMessage("New connection! ({$conn->resourceId})");
        $res = [
            "room" => 0,
            "type" => "YOU ARE",
            "payload" => $conn->resourceId
        ];
        $conn->send(json_encode($res));
    }

    public function onMessage(ConnectionInterface $conn, $raw) {
        logMessage(sprintf("New message from '%s': %s", $conn->resourceId, $raw));

        $msg = json_decode($raw, true);

        if ($msg["type"] == "CREATEROOM") {
            $room = random_int(10000, 99999);
            $rooms[$room] = [$conn->resourceId];

            logMessage(sprintf("Created room %s", $room));

            $pseudo = $msg["payload"];
            $pseudos[$conn->resourceId] = $pseudo;

            $res = [
                "room" => $room,
                "type" => "CREATED",
                "payload" => ""
            ];
            $conn->send(json_encode($res));
        }
        
        if ($msg["type"] == "NEW PLAYER") {
            if (in_array($msg["room"], array_keys($rooms))) {
                $pseudo = $msg["payload"];
                $pseudos[$pseudo] = $conn->resourceId;

                foreach ($this->clients as $client) {
                    if ($conn !== $client) {
                        logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw));
                        $client->send($raw);
                    }
                }
            } else {
                $res = [
                    "room" => $msg["room"],
                    "type" => "NOT ROOM",
                    "payload" => ""
                ];
                $conn->send(json_encode($res));
                logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw));
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $room = isMaster($conn->resourceId);
        if ($room !== -1) {
            foreach ($this->clients as $client) {
                if ($conn !== $client && in_array($client->resourceId, $rooms[$room])) {
                    $res = [
                        "room" => $room,
                        "type" => "DELETED",
                        "payload" => ""
                    ];
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $res));
                    $client->send($raw);
                }
            }
            unset($rooms[$room]);
        } else {
            foreach (array_keys($rooms) as $key) {
                $rooms[$key] = array_diff($rooms[$key], [$conn->resourceId]);
            }
            $res = [
                "room" => $room,
                "type" => "CLIENT GONE",
                "payload" => $conn->resourceId
            ];
            logMessage(sprintf("New message sent to '%s': %s", $conn->resourceId, $res));
            $conn->send($raw);
        }
        $this->clients->detach($conn);
        logMessage("Connection {$conn->resourceId} is gone");
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        logMessage("An error occured on connection {$conn->resourceId}: {$e->getMessage()}");
        $conn->close();
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