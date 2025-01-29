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

function createRoom() {
    $i = random_int(10000, 99999);
    while (in_array($i, array_keys($rooms))) {
        $i = random_int(10000, 99999);
    }
    return $i;
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
            $room = createRoom();
            $rooms[$room] = [$conn->resourceId];

            logMessage(sprintf("Created room %s", $room));

            $pseudo = $msg["payload"];
            $pseudos[$pseudo] = $conn->resourceId;

            $res = [
                "room" => $room,
                "type" => "CREATED",
                "payload" => ""
            ];
            $conn->send(json_encode($res));
        }
        
        if ($msg["type"] == "NEW PLAYER") {
            $pseudo = $msg["payload"];
            $pseudos[$pseudo] = $conn->resourceId;
        }

        foreach ($this->clients as $client) {
            if ($conn !== $client) {
                logMessage(sprintf("New message sent to '%s': %s", $conn->resourceId, $raw));
                $client->send($raw);
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
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