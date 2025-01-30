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
    } 
    else if (msg["type"] == "NEW PLAYER") {
        pseudo = msg["payload"];
        item = {"pseudo": pseudo, "color": "#FFF"};
        players.push(item);
    } 
    else if (msg["type"] == "CREATED") {
        room = msg["room"];
        $("#roomId").text("Room "+room);
        $("#roomId2").text("Room "+room);
    } 
    else if (msg["type"] == "NOT ROOM") {
        $("#sepconn").show();
        $("#notroom").show();
    } 
    else if (msg["type"] == "WELCOM PLAYER") {
        $("#waitBody").show();
        $("#gameBody").hide();
        $("#connBody").hide();
        room = msg["room"];
        $("#roomId").text("Room "+room);
        $("#roomId2").text("Room "+room);
    } 
    else if (msg["type"] == "PLAYER READY") {
        spl = msg["payload"].split(';');
        pseudo = spl[1];
        hex = spl[0];
        for (const i of players) {
            console.log(i["pseudo"], pseudo);
            if (i["pseudo"] == pseudo) {
                i["color"] = hex;
            }
        }
        item = {"pseudo": pseudo, "color": hex};
        addPlayer(item);
        readies += 1;

        if (readies == players.length) {
            $("#beginBtn").show();
        } else {
            $("#beginBtn").hide();
        }
    }
    else if (msg["type"] == "DELETED") {
        alert("Le maître de jeu est parti. Partie supprimée.");
        $("#readyBtn").show();
        $("#waitBody").hide();
        $("#gameBody").hide();
        $("#connBody").show();
    }
    else if (msg["type"] == "CLIENT GONE") {
        pseudo = msg["payload"];
        removePlayer(pseudo);
        tmp = players.filter((player) => player["pseudo"] != pseudo);
        players = tmp;
        readies -= 1;
        if (readies == players.length) {
            $("#beginBtn").show();
        } else {
            $("#beginBtn").hide();
        }
    }
    else if (msg["type"] == "BEGIN GAME") {
        $("#waitBody").hide();
        $("#connBody").hide();
        $("#gameBody").show();
        $("#timer").show();
        $("#timer").click();
    }

    return false;
};

conn.onclose = function(e) {
    console.log(e);
    console.log("Bye bye!");
}

function reconnect() {
    conn = new WebSocket('wss://blindtest.jorismartin.fr/websocket');
}