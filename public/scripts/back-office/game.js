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
    $("#player").hide();
    $("#timer").addClass("d-none");

    width = $($('#tabPlayer')[0]).width();
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

        if (player) {
            player.stopVideo();
            player.destroy();
        }

        const winner = $($("#playerList .list-group-item")[0]).data("pseudo");
        $.ajax({
            url: urls.end_of_game,
            data: {
                'winner': winner
            },
            method: 'POST'
        }).then(() => {
            Swal.fire({
                title: "Fin de la partie",
                text: "Vainqueur : " + winner,
                color: "#FFF",
                confirmButtonText: "Fin de la partie",
                customClass: {
                    popup: 'glassmorph',
                },
                background: "url('/images/swal_bg.png')"
            }).then(() => window.location.href += '/');
        });
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
        color: "#FFF",
        customClass: {
            popup: 'glassmorph',
        },
        background: "url('/images/swal_bg.png')"
    }).then((result) => {
        $.ajax({
            url: urls.round_valid,
            data: {
                'isValid': result.isConfirmed,
                'buzzer': data.token,
                'points': videos[current].points
            },
            method: 'POST'
        });
    });
});

function buildPlayer(video) {
    readyPlayersCount = 0;

    var opt = {
        videoId: video.video,
        events: {
            'onReady': () => {
                $.ajax({
                    url: urls.round_ready,
                    data: {
                        'round': current
                    },
                    method: 'POST'
                });
            },
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