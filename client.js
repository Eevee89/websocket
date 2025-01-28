var conn = new WebSocket('wss://blindtest.jorismartin.fr/websocket');
conn.onopen = function(e) {
    console.log("Connection established!");
    conn.send('Hello World');
};

conn.onmessage = function(e) {
    console.log(e.data);
};