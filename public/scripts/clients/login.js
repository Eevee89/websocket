$(document).ready(() => {
    const socket = new WebSocket("wss://blindtest.jorismartin.fr/ws");
    socket.onmessage = (e) => {
        const datas = e.data;
        const response = JSON.parse(datas);

        if (response.route === "login") {
            if (!response.success) {
                showErrorSwal("Connexion au serveur impossible", response.message);
                return;
            }
        }

        if (response.route === "room/create") {
            if (!response.success) {
                showErrorSwal("Création de partie impossible", response.message);
                return;
            }

            $("#form_roomId").val(response.datas.room);
            $("#form_create_room").click();
            return;
        }

        if (response.route === "room/join") {
            if (!response.success) {
                showErrorSwal("Impossible de rejoindre la partie", response.message);
                return;
            }

            $("#form_join_room").click();
            return;
        }
    };
    
    socket.onerror = (e) => console.log(e);

    socket.onclose = () => {
        Swal.fire({
            title: "Connexion coupée",
            text: "La connexion avec le serveur a été interompue. Veuillez recharger la page.",
            confirmButtonText: "OK",
            color: "var(--dark)",
            customClass: {
                confirmButton: "striped-warning-light",
            },
            background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
        });

        $("#create-room-btn").prop("disabled", true);
        $("#join-room-btn").prop("disabled", true);
    };

    socket.onopen = () => {
        const message = JSON.stringify({
            "route": "login",
            "datas": {
                "token": token
            }
        });

        socket.send(message);
        console.log("SEND: " + message);
    };

    $("#create-room-btn").click(() => {
        const message = JSON.stringify({
            "route": "room/create",
            "datas": {
                "pseudo": $("#form_pseudo").val()
            }
        });

        socket.send(message);
        console.log("SEND: " + message);
    });

    $("#join-room-btn").click(() => {
        const message = JSON.stringify({
            "route": "room/join",
            "datas": {
                "room": $("#form_roomId").val(),
                "pseudo": $("#form_pseudo").val()
            }
        });

        socket.send(message);
        console.log("SEND: " + message);
    });
});