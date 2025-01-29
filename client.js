var conn = new WebSocket('wss://blindtest.jorismartin.fr/websocket');
conn.onopen = function(e) {
    console.log("Connection established!");
};

conn.onmessage = function(e) {
    msg = JSON.parse(e.data);
    console.table(msg);
    if (msg["type"] == "YOU ARE") {
        id = msg["payload"];
        connId = parseInt(id);
    } else if (msg["type"] == "NEWPLAYER") {
        pseudo = msg["payload"];
        item = {"pseudo": pseudo, "color": "#AA0000"};
        addPlayer(item);
        players.push(item);
    } else if (msg["type"] == "CREATED") {
        room = msg["room"];
        $("#roomId").text("Room "+room);
    } else if (msg["type"] == "NOT ROOM") {
        $("#notroom").show();
    }
};

conn.onclose = function(e) {
    console.log("Bye bye!");
}