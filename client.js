var conn = new WebSocket('wss://blindtest.jorismartin.fr/websocket');
conn.onopen = function(e) {
    console.log("Connection established!");
};

conn.onmessage = function(e) {
    msg = e.data;
    console.log(msg);
    if (msg.includes("You are")) {
        spl = msg.split(" ");
        connId = parseInt(spl[spl.length -1]);
    } else if (msg.includes("NEWPLAYER")) {
        pseudo = msg.split(" ");
        item = {"pseudo": pseudo, "color": "#AA0000"};
        addPlayer(item);
        players.push(item);
    }
};