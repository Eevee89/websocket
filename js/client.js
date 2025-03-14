var conn = new WebSocket('wss://blindtest.jorismartin.fr/websocket');
conn.onopen = function(e) {
    $("#notconnected").hide();
};

conn.onmessage = async function(e) {
    msg = JSON.parse(e.data);
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
        new PNotify({
            title: 'ID de partie invalide',
            text: "La partie "+msg["room"]+" n'existe pas.",
            type: 'warning',
            delay: 3000
        });
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
        if (readies == nbPlayers && nbPlayers >= 2 && videosIds.length > 0) {
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
        let nbPlayers = Object.keys(players).length; 
        if (readies == nbPlayers && nbPlayers >= 2 && videosIds.length > 0) {
            $("#beginBtn").show();
        } else {
            $("#beginBtn").hide();
        }
    }
    else if (msg["type"] == "BEGIN GAME" || msg["type"] == "CONTINUE GAME") {
        spl = msg["payload"].split(';');
        nbVids = parseInt(spl[0]);
        hideTime = parseInt(spl[1]);
        nbEssais = parseInt(spl[2]);
        customNbEssais = nbEssais;
        customTitle = spl[3];
        videoId = spl[4];
        musicId = parseInt(spl[5]);
        timerStop = false;
        timerPaused = false;
        if ($("#rightPanel").css("flex-direction") == "column") {
            $("#thumb").attr({src: "https://img.youtube.com/vi/"+videoId+"/maxresdefault.jpg", alt: 'Not implemented'});
        } else {
            $("#thumb").attr({src: "https://img.youtube.com/vi/"+videoId+"/mqdefault.jpg", alt: 'Not implemented'});
        }

        $("#countdown").text(hideTime);
        $("#waitBody").hide();
        $("#connBody").hide();
        $("#gameBody").show();
        $("#timer").show();
        if (customNbEssais != 0) {
            $("#buzCont").show();
        }
        $("#mainMobile").show();
        $("#ansCont").hide();
        $("#timer").click();
        $("#progressLbl").text("Musique "+ zeroPad(parseInt(musicId)+1, 2)+ "/" + zeroPad(nbVids, 2));
    }
    else if (msg["type"] == "BUZZER") {
        $("#buzCont").hide();
        timerPaused = true;
        player.pauseVideo();
        await delay(100);
        spl = msg["payload"].split(';');
        let ps = spl[0];
        let answ = spl[1];
        if (videosIds.length != 0) { // Master of the game
            val = confirm(
                "Le joueur "+ ps +" a buzzé !\n"+
                "Sa réponse : "+answ+"\n"+
                "Valider ? [OK] pour oui, [Annuler] pour non"
            );

            player.playVideo();

            nmsg = {
                "room": room,
                "type": "BUZZER VALIDATION",
                "payload": val ? 1 : 0
            };
            conn.send(JSON.stringify(nmsg));

            if (val) {
                players[ps]["score"] += 1;
                timerStop = true;
            } else {
                await delay(100);
            }
            timerPaused = false;
        }
    }
    else if (msg["type"] == "BUZZER VALIDATION") {
        if (msg["payload"] == 1) {
            timerStop = true;
        }
        timerPaused = false;
        if (customNbEssais != 0) {
            $("#buzCont").show();
        }
    }
    else if (msg["type"] == "END GAME") {
        timerStop = true;
        let alertMsg;
        if (msg["payload"] == myPseudo) {
            alertMsg = "La partie est finie, vous avez gagné !";
        } else {
            alertMsg = "La partie est finie. Le joueur "+ msg["payload"] +" a gagné.";
        }

        alert(alertMsg);

        $("#timer").hide();
        $("#buzBtn").hide();
        $("#waitBody").show();
        $("#gameBody").hide();
        $("#clearready").show();
    }

    return false;
};

conn.onclose = function(e) {
    alert("Votre connexion au serveur a été coupée.\nVous allez être renvoyé au menu principal.");
    $("#connBody").show();
    $("#mainBody").hide();
    $("#gameBody").hide();
    $("#waitBody").hide();
    $("#notconnected").show();
    window.location.reload();
}