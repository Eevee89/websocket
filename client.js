var conn = new WebSocket('wss://blindtest.jorismartin.fr/websocket');
conn.onopen = function(e) {
    console.log("Connection established!");
    $("#notconnected").hide();
};

conn.onmessage = async function(e) {
    msg = JSON.parse(e.data);
    console.table(msg);
    if (msg["type"] == "YOU ARE") {
        id = msg["payload"];
        connId = parseInt(id);
    } 
    else if (msg["type"] == "NEW PLAYER") {
        pseudo = msg["payload"];
        item = {"pseudo": pseudo, "color": "#FFF"};
        players[pseudo] = {
            "color": "#FFF",
            "score": 0
        };
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
        players[pseudo]["color"] = hex;
        addPlayer(pseudo, players[pseudo]);
        readies += 1;

        let nbPlayers = Object.keys(players).length; 
        if (readies == nbPlayers && nbPlayers >= 2 && videosIds.length > 1) {
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
        delete players[pseudo];
        readies -= 1;
        let nbPlayers = Object.keys(players).length; 
        if (readies == nbPlayers && pnbPlayers >= 2 && videosIds.length > 1) {
            $("#beginBtn").show();
        } else {
            $("#beginBtn").hide();
        }
    }
    else if (msg["type"] == "BEGIN GAME") {
        spl = msg["payload"].split(';');
        nbVids = parseInt(spl[0]);
        hideTime = parseInt(spl[1]);
        showTime = parseInt(spl[2]);

        $("#waitBody").hide();
        $("#connBody").hide();
        $("#gameBody").show();
        $("#timer").show();
        $("#timer").click();
        $("#progressLbl").text("Musique 01/" + zeroPad(nbVids, 2));
    } else if (msg["type"] == "CONTINUE GAME") {
        $("#countdown").text(hideTime);
        timerStop = false;
        timerPaused = false;
        $("#timer").show();
        $("#buzBtn").show();
        $("#timer").click();
        $("#progressLbl").text("Musique "+ zeroPad(parseInt(msg["payload"]), 2)+ "/" + zeroPad(nbVids, 2));
    } else if (msg["type"] == "BUZZER") {
        timerPaused = true;
        player.pauseVideo();
        $("#buzBtn").hide();
        await delay(100);
        if (videosIds.length != 0) { // Master of the game
            val = confirm("Le joueur "+ msg["payload"] +" a buzzé !\nValider sa réponse ?\n[OK] pour oui, [Cancel] pour non");

            player.playVideo();

            nmsg = {
                "room": room,
                "type": "BUZZER VALIDATION",
                "payload": val ? 1 : 0
            };
            conn.send(JSON.stringify(nmsg));

            if (val) {
                players[msg["payload"]]["score"] += 1;
                const sortedPlayers = Object.entries(players) 
                                        .sort((a, b) => b[1].score - a[1].score) 
                                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
                $("#playerList").html("");
                for(const pseudo of Object.keys(sortedPlayers)) {
                    createPlayerItem(sortedPlayers[pseudo], pseudo);
                }
                timerStop = true;
            }
            timerPaused = false;
        }
    } else if (msg["type"] == "BUZZER VALIDATION") {
        if (msg["payload"] == 1) {
            timerStop = true;
        }
        timerPaused = false;
        $("#buzBtn").show();
    } else if (msg["type"] == "END GAME") {
        if (msg["payload"] == myPseudo) {
            $("#iwon").show();
        } else {
            $("#hewon").text("La partie est finie. Le joueur "+ msg["payload"] +" a gagné.");
            $("#hewon").show();
        }
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