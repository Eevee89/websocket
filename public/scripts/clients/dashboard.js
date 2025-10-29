$(document).ready(() => {
    window.mySocket = new WebSocket("http://localhost:9000");
    window.mySocket.onmessage = (e) => {
        const datas = e.data;
        const response = JSON.parse(datas);

        if (response.route === "login") {
            console.log("HERE");
            if (!response.success) {
                showErrorSwal("Connexion au serveur impossible", response.message);
                return;
            }

            const message = JSON.stringify({
                "route": "dump/rooms",
                "datas": {}
            });

            window.mySocket.send(message);
            console.log("SEND: " + message);

            return;
        }

        if (response.route === "room/join") {
            const player = response.datas;
            $("#playerList").append(generatePlayerListItem(player.pseudo, player.team, player.color));
            $("#playerGameList").append(generatePlayerListItem(player.pseudo, player.team, player.color));
            $(".btn-go").addClass("disabled");

            return;
        }

        if (response.route === "room/kick-out") {
            if (!response.success) {
                showErrorSwal("Impossible de supprimer ce joueur", response.message);
                return;
            }

            $($('[data-pseudo="' + response.datas.player + '"]')[0]).remove();

            if ($('#playerList .list-group-item').length === 0) {
                $(".btn-go").addClass("disabled");
            }

            return;
        }

        if (response.route === "dump/rooms") {
            if (!response.success) {
                showErrorSwal("Impossible de récupérer les joueurs", response.message);
                return;
            }

            const rooms = response.datas;
            for (const roomId in rooms) {
                const room = rooms[roomId];
                if (roomId == thisRoom && room.master == token) {
                    for (const key in room) {
                        if (key !== "master" && key != token) {
                            const player = room[key];
                            const item = generatePlayerListItem(player.pseudo, player.team, player.color);

                            if (player.ready) {
                                item.removeClass("not-ready").addClass("ready");
                            }

                            $("#playerList").append(item);
                        }
                    }

                    if (everyoneReady()) {
                        $(".btn-go").removeClass("disabled");
                    }
                }
            }

            return;
        }

        if (response.route === "room/ready") {
            const datas = response.datas;
            if (iAmMaster) {
                $("li[data-pseudo='" + datas.pseudo + "']").removeClass("not-ready").addClass("ready");

                if (everyoneReady()) {
                    $(".btn-go").removeClass("disabled");
                }
            } else {
                console.log(response);
            }
        }
    };
    
    window.mySocket.onerror = (e) => console.log(e);

    window.mySocket.onclose = () => {
        window.location.href = "/";
    };

    window.mySocket.onopen = () => {
        const message = JSON.stringify({
            "route": "login",
            "datas": {
                "token": token
            }
        });

        window.mySocket.send(message);
        console.log("SEND: " + message);
    };
});