<?php
require __DIR__.'/vendor/autoload.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use React\EventLoop\Loop;
use React\Socket\SecureServer;
use React\Socket\SocketServer;
use React\Socket\TcpServer;

$env = parse_ini_file(".env");
$port = '8000';

/*$loop = Factory::create();

$tcp = new TcpServer('127.0.0.1:'.$port, $loop);

$secureTcp = new SecureServer($tcp, $loop, [
    'local_cert' => $env["SSL_CERT"],
    'local_pk' => $env["SSL_KEY"],
    'verify_peer' => false,
    'verify_peer_name' => false,
    'allow_self_signed' => false
]);*/

$loop =  Loop::get();
$webSock = new SocketServer('0.0.0.0:'.$port);

$secureWebSock = new SecureServer(
    $webSock,
    $loop,
    [
        'local_cert' => $env["SSL_CERT"],
        'local_pk' => $env["SSL_KEY"],
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => false
    ]
);

$logFile = '/var/log/websocket/websocket.log';

function logMessage($message, $room) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] | Room $room | " . $message . "\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

class ServerImpl implements MessageComponentInterface {
    protected $clients;
    protected $rooms = [];
    protected $pseudos = [];

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
        logMessage("New connection! ({$conn->resourceId})", "0");
    }

    public function onMessage(ConnectionInterface $conn, $raw) {
        $msg = json_decode($raw, true);
        logMessage(sprintf("New message from '%s': %s", $conn->resourceId, $raw), $msg["room"]);

        if ($msg["type"] == "CREATEROOM") {
            $room = random_int(10000, 99999);
            $this->rooms[$room] = [$conn->resourceId];

            logMessage(sprintf("Created room %s", $room), $room);

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
                $pseudo = $msg["payload"];
                $this->pseudos[$conn->resourceId] = $pseudo;

                foreach ($this->clients as $client) {
                    if (in_array($client->resourceId, $targets)) {
                        if ($conn !== $client) {
                            logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw), $msg["room"]);
                            $client->send($raw);
                        } else {
                            $res = [
                                "room" => $msg["room"],
                                "type" => "WELCOM PLAYER",
                                "payload" => ""
                            ];
                            $conn->send(json_encode($res));
                            logMessage(sprintf("New message sent to '%s': %s", $conn->resourceId, json_encode($res)), $msg["room"]);
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
                logMessage(sprintf("New message sent to '%s': %s", $conn->resourceId, json_encode($res)), $msg["room"]);
            }
        }

        if ($msg["type"] == "READY") {
            $targets = $this->rooms[$msg["room"]];
            $players = $this->pseudos;
            $res = [
                "room" => $msg["room"],
                "type" => "PLAYER READY",
                "payload" => sprintf("%s;%s", $msg["payload"], $players[$conn->resourceId])
            ];
            foreach ($this->clients as $client) {
                if (in_array($client->resourceId, $targets) && $conn !== $client) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)), $msg["room"]);
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
            $targets = $this->clients;
            foreach ($targets as $client) {
                $tmp = $this->rooms[$msg["room"]];
                if ($conn !== $client && in_array($client->resourceId, $tmp)) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)), $msg["room"]);
                    $client->send(json_encode($res));
                }
            }
        }

        if ($msg["type"] == "BEGIN GAME" || $msg["type"] == "CONTINUE GAME") {
            $targets = $this->rooms[$msg["room"]];
            foreach ($this->clients as $client) {
                if (in_array($client->resourceId, $targets) && $conn !== $client) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw), $msg["room"]);
                    $client->send($raw);
                }
            }
        }

        if ($msg["type"] == "BUZZER") {
            $targets = $this->rooms[$msg["room"]];
            $players = $this->pseudos;
            $res = [
                "room" => $msg["room"],
                "type" => "BUZZER",
                "payload" => $players[$conn->resourceId].";".$msg["payload"]
            ];
            foreach ($this->clients as $client) {
                if (in_array($client->resourceId, $targets) && $conn !== $client) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)), $msg["room"]);
                    $client->send(json_encode($res));
                }
            }
        }

        if ($msg["type"] == "BUZZER VALIDATION") {
            $targets = $this->rooms[$msg["room"]];
            foreach ($this->clients as $client) {
                if (in_array($client->resourceId, $targets) && $conn !== $client) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw), $msg["room"]);
                    $client->send($raw);
                }
            }
        }

        if ($msg["type"] == "END GAME") {
            $targets = $this->rooms[$msg["room"]];
            foreach ($this->clients as $client) {
                if (in_array($client->resourceId, $targets) && $conn !== $client) {
                    logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, $raw), $msg["room"]);
                    $client->send($raw);
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        logMessage("Connection {$conn->resourceId} is gone", 0);
        $room = $this->roomOf($conn->resourceId);
        $this->clients->detach($conn);
        
        if ($room !== -1) {  // The leaving conn is in a room
            $tmp = $this->rooms;
            $ismaster = $tmp[$room][0] === $conn->resourceId;

            if ($ismaster) { // The leaving con is the master of the room
                foreach ($this->clients as $client) {
                    $tmp = $this->rooms[$room];
                    if ($conn !== $client && in_array($client->resourceId, $tmp)) {
                        $res = [
                            "room" => $room,
                            "type" => "DELETED",
                            "payload" => ""
                        ];
                        logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)), $room);
                        $client->send(json_encode($res));
                    }
                }
                unset($this->rooms[$room]);
                logMessage(sprintf("Deleted room %s", $room), $room);
            } 
            else {
                $tmp = $this->rooms;
                $id = array_search($conn->resourceId, $tmp[$room]);
                unset($tmp[$room][$id]);
                $this->rooms = $tmp;
                $players = $this->pseudos;
                foreach ($this->clients as $client) {
                    $tmp = $this->rooms[$room];
                    if ($conn !== $client && in_array($client->resourceId, $tmp)) {
                        $res = [
                            "room" => $room,
                            "type" => "CLIENT GONE",
                            "payload" => $players[$conn->resourceId]
                        ];
                        logMessage(sprintf("New message sent to '%s': %s", $client->resourceId, json_encode($res)), $room);
                        $client->send(json_encode($res));
                    }
                }
            }
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        logMessage("An error occured on connection {$conn->resourceId}: {$e->getMessage()}", "0");
        $conn->close();
    }

    public function roomOf($connId) {
        $tmp = $this->rooms;
        foreach ($tmp as $roomId => $room) {
            if (in_array($connId, $room)) {
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
    $secureWebSock,
    $loop
);
echo "Server created on port $port\n\n";
$server->run();