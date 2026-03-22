// TODO: onReady => round/ready
$(document).ready(() => {
    if ($(".nav").css("display") === "none") {
        $(".game").addClass("row justify-content-around align-items-end p-3").removeClass("tab-content");
        $("#tabMain").addClass("col-7").removeClass("tab-pane fade show active m-2");
        $("#countdown").css("font-size", "8rem");
    } else {
        $(".game").addClass("tab-content").removeClass("row justify-content-around align-items-end p-3");
        $("#tabMain").addClass("tab-pane fade show active m-2").removeClass("col-7");
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
});

function buildPlayer(video) {
    readyPlayersCount = 0;

    const opt = {
        videoId: video.video,
        events: {
            'onReady': () => {
                $.ajax({
                    url: urls.player_ack_ready,
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
    $("#answer").text(video.title);
    $("#points").text("Points : " + video.points)
    $(".tracker").text(`${current + 1}`.padStart(2, '0') + "/" + `${videoCount}`.padStart(2, '0'));

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
        }).then(async () => {
            $("#player").show();
            $("#timer").addClass("d-none");
            $("#countdown").text(HIDE + 1);

            await delay(5000);

            Swal.fire({
                title: "Porchain round",
                text: "Prêt pour le prochain round ?",
                confirmButtonText: "Oui",
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: urls.player_ack_finish,
                        method: 'POST'
                    }).done(() => {
                        localStorage.setItem('userInteractedWithMedia', 'true');
                    });
                }
            });
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