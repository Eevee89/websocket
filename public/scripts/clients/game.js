$(document).ready(() => {
    window.mySocket = new WebSocket("wss://blindtest.jorismartin.fr/ws");
    window.mySocket.onmessage = (e) => {
        const datas = e.data;
        const response = JSON.parse(datas);

        if (response.route === "login") {
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
                            const item = generatePlayerListItem(player.pseudo, player.team, player.color, false);
                            $("#playerList").append(item);
                        }
                    }
                }
            }

            return;
        }

        if (response.route === "round/ready") {
            if (!response.success) {
                showErrorSwal("Impossible de se mettre prêt", response.message);
                return;
            }

            const datas = response.datas;
            if (iAmMaster) {
                $("li[data-pseudo='" + datas.pseudo + "']").removeClass("not-ready").addClass("ready");
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