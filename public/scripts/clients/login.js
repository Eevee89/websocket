$(document).ready(() => {
    // --- BOUTON CRÉER ---
    $("#create-room-btn").on('click', function (e) {
        e.preventDefault();

        const pseudo = $("#form_pseudo").val();
        if (!pseudo) {
            showErrorSwal("Champ manquant", "Veuillez saisir un pseudo.");
            return;
        }

        new YT.Player('player', {
            videoId: 'FtutLA63Cp8',
            events: {
                'onReady': () => {
                    $.ajax({
                        url: urls.create,
                        method: 'POST',
                        data: {
                            pseudo: pseudo
                        },
                    })
                    .done(function (response) {
                        console.log(response);
                        if (response.success) {
                            $("#form_create_room").click();
                        } else {
                            showErrorSwal("Création impossible", response.message);
                        }
                    })
                    .fail(function (xhr) {
                        const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Erreur serveur";
                        showErrorSwal("Erreur", errorMsg);
                    });
                },
                'onError': () => {
                    showErrorSwal(
                        "Player Youtube non supporté",
                        "Votre navigateur ne supporte pas les players Youtube intégrés.\n"
                        + "Veuillez réessayer depuis Chrome, Opéra ou Edge."
                    );
                }
            },
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
                origin: window.location.host
            },
        });
    });

    // --- BOUTON REJOINDRE ---
    $("#join-room-btn").on('click', function (e) {
        e.preventDefault();

        const roomId = $("#form_roomId").val();
        const pseudo = $("#form_pseudo").val();

        if (!roomId || !pseudo) {
            showErrorSwal("Champs manquants", "ID de partie et pseudo requis.");
            return;
        }

        new YT.Player('player', {
            videoId: 'FtutLA63Cp8',
            events: {
                'onReady': () => {
                    $.ajax({
                        url: urls.join,
                        method: 'POST',
                        data: {
                            room: roomId,
                            pseudo: pseudo
                        },
                    })
                    .done(function (response) {
                        if (response.success) {
                            $("#form_join_room").click();
                        } else {
                            showErrorSwal("Impossible de rejoindre", response.message);
                        }
                    })
                    .fail(function (xhr) {
                        const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Erreur de connexion";
                        showErrorSwal("Erreur", errorMsg);
                    });
                },
                'onError': () => {
                    showErrorSwal(
                        "Player Youtube non supporté",
                        "Votre navigateur ne supporte pas les players Youtube intégrés.\n"
                        + "Veuillez réessayer depuis Chrome, Opéra ou Edge."
                    );
                }
            },
            host: 'https://www.youtube-nocookie.com',
            playerVars: {
                origin: window.location.host
            }
        });
    });
});