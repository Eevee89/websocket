<?php
$client = new WebSocketClient("wss://blindtest.jorismartin.fr/websocket");
$client->text('Hello PieSocket!');
while (true) {
    try {
        $message = $client->receive();
        print_r($message);
        echo "n";
      } catch (WebSocketConnectionException $e) {
        // Possibly log errors
        print_r("Error: ".$e->getMessage());
    }
}
$client->close();