$(document).ready(() => {
    if ($(".nav").css("display") === "none") {
        $(".game").addClass("row justify-content-around align-items-end p-3").removeClass("tab-content");
        $("#tabPlayer").addClass("col-7").removeClass("tab-pane fade show active m-2");
        $("#tabPlayersContent").addClass("col-3").removeClass("tab-pane fade show active m-2");
        $("#countdown").css("font-size", "8rem");
    } else {
        $(".game").addClass("tab-content").removeClass("row justify-content-around align-items-end p-3");
        $("#tabPlayer").addClass("tab-pane fade show active m-2").removeClass("col-7");
        $("#tabPlayersContent").addClass("tab-pane fade show active m-2").removeClass("col-3");
        $("#countdown").css("font-size", "6rem");
    }

    $(".dashboard").hide();
    $("#countdown").css("color", "var(--success)");
    $("#timer").css("border-color", "var(--success)");
    $(".game").show();
    $(".game-controls").removeClass("d-none");
    $("#player").hide();
    $("#timer").addClass("d-none");

    width = $($('.col-7')[0]).width();
    localStorage.setItem('playerBuilt', 'true');
    buildPlayer(videos[current]);

    $(".btn-next").click(() => {
        if ($(".btn-next").hasClass("disabled")) {
            return;
        }

        localStorage.setItem('userInteractedWithMedia', 'true');
        $("#player").hide();
        $("#timer").addClass("d-none");

        if (current !== videos.length) {
            localStorage.setItem('playerBuilt', 'true');
            buildPlayer(videos[current]);
            return;
        }

        Swal.fire({
            title: "Fin de la partie",
            text: "Vainqueur : " + $($("#playerList .list-group-item")[0]).data("pseudo"),
            color: "var(--dark)",
            customClass: {
                confirmButton: "striped-info-light"
            },
            background: "repeating-linear-gradient(-45deg, var(--info), var(--info) 20px, var(--info-shade) 20px, var(--info-shade) 40px)"
        });

        if (player) {
            player.stopVideo();
            player.destroy();
        }

        window.location.href += 'dashboard';
    });
});

$(document).on("click", ".list-group-item", async (event) => {
    if ($("#timer").hasClass("d-none")) {
        return;
    }

    const tile = $(event.target).closest('.list-group-item');
    player.pauseVideo();
    timerPaused = true;
    Swal.fire({
        title: "Buzz de " + tile.data("pseudo"),
        text: "Est-ce la bonne réponse ?",
        showCancelButton: true,
        confirmButtonText: "Oui",
        cancelButtonText: "Non",
        color: "var(--dark)",
        customClass: {
            confirmButton: "striped-success-light",
            cancelButton: "striped-danger-light"
        },
        background: "repeating-linear-gradient(-45deg, var(--info), var(--info) 20px, var(--info-shade) 20px, var(--info-shade) 40px)"
    }).then((result) => {
        if (result.isConfirmed) {
            const span = tile.find("#score");
            const score = Number(span.text()) + Number(videos[current].points);
            span.text(`${score}`.padStart(3, '0'));
            sortPlayersByScore();
            answerGiven = true;
        }
        timerPaused = false;
        player.playVideo();
    });
});

function buildPlayer(video) {
    var opt = {
        videoId: video.video,
        events: {
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        },
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
            origin: window.location.host
        },
        width: width - 20,
        height: (width - 20) * 9 / 16
    };

    $("#category").text("Categorie : " + video.category);
    $("#answer").text("???");
    $("#points").text("Points : " + video.points)
    $(".tracker").text(`${current + 1}`.padStart(2, '0') + "/" + `${videos.length}`.padStart(2, '0'));

    if (player) {
        player.stopVideo();
        player.destroy();
    }

    player = new YT.Player('player', opt);
    timerPaused = false;
    answerGiven = false;
    new Promise((resolve) => {
        const checkReadyInterval = setInterval(() => {
            if (isPlayerReady(player)) {
                clearInterval(checkReadyInterval);
                resolve();
            }
        }, 100);
    }).then(() => {
        try {
            const hasInteracted = localStorage.getItem('userInteractedWithMedia') === 'true';
            if (hasInteracted) {
                localStorage.setItem('userInteractedWithMedia', 'false');
                const message = JSON.stringify({
                    "route": "round/ready",
                    "datas": {
                        "room": thisRoom,
                        "pseudo": "A"
                    }
                });

                window.mySocket.send(message);
                console.log("SEND: " + message);
                new Promise((resolve) => { 
                    const checkReadyInterval = setInterval(() => {
                        if (everyoneReady()) {
                            clearInterval(checkReadyInterval);
                            resolve();
                        }
                    }, 100);
                }).then(() => {
                    player.unMute();
                    player.setVolume(100);
                    $("#countdown").css("color", "var(--success)");
                    $("#timer").css("border-color", "var(--success)");
                    player.playVideo();
                });
            }
        } catch (e) {
            console.log(e);
        }
    });
}

const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms));
};

function isPlayerReady(player) {
    try {
        return player && player.getPlayerState() !== -1;
    } catch (e) {
        return false;
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        if (localStorage.getItem('playerBuilt') === 'false') {
            return;
        }


        localStorage.setItem('playerBuilt', 'false');

        let seconds = HIDE;
        $("#timer").removeClass("d-none");
        $(".btn-next").addClass("disabled");
        new Promise((resolve) => {
            const timer = setInterval(() => {
                if (!timerPaused) {
                    $("#countdown").css("color", colors[HIDE - seconds]);
                    $("#timer").css("border-color", colors[HIDE - seconds]);
                    $("#countdown").text(seconds--);
                }

                if (seconds === -1 || answerGiven) {
                    clearInterval(timer);
                    console.log("Timer cleared");
                    resolve();
                }
            }, 1000);
        }).then(() => {
            $("#player").show();
            $("#timer").addClass("d-none");
            $("#answer").text(videos[current++].title);
            $("#countdown").text(HIDE + 1);
            $(".btn-next").removeClass("disabled");
            $(".list-group-item").removeClass("ready").addClass("not-ready");
        });
    }
}

function onPlayerError(event) {
    console.error("Erreur du lecteur YouTube. Code d'erreur:", event.data);
    // Codes d'erreurs courants :
    // 2 : ID de vidéo invalide
    // 5 : Erreur liée au lecteur HTML5
    // 100 : Vidéo introuvable (supprimée/privée)
    // 101/150 : Le propriétaire n'autorise pas la lecture intégrée
}

function sortPlayersByScore() {
    const playersList = $('#playerList');
    const players = playersList.find('li').get();

    players.sort(function (a, b) {
        const scoreA = Number($(a).find("#score").text());
        const scoreB = Number($(b).find("#score").text());

        return scoreB - scoreA;
    });

    playersList.html(players);
}