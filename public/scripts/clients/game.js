let totalPlayersInRoom = 0;

channel.members.each((member) => {
    if (!member.info.isMaster) {
        totalPlayersInRoom++;
    }
});

channel.bind('round-ready', (data) => {
    if (!iAmMaster) {
        videoCount = data.count;
        HIDE = data.hideTime;
        
        if (current !== videoCount) {
            colors = gradientColorsCompute(HIDE);

            $("#player").hide();
            $("#timer").addClass("d-none");
            localStorage.setItem('playerBuilt', 'true');

            buildPlayer(data.videoId);
            return;
        }

        if (player) {
            player.stopVideo();
            player.destroy();
        }

        Swal.fire({
            title: "Fin de la partie",
            text: "Vainqueur : A CHANGER",
            color: "#FFF",
            confirmButtonText: "Fin de la partie",
            customClass: {
                popup: 'glassmorph',
            },
            background: "url('/images/swal_bg.png')"
        }).then(() => window.location.href = window.location.origin);
    }
});

channel.bind('game-end', (data) => {
    if (!iAmMaster) {
        if (player) {
            player.stopVideo();
            player.destroy();
        }

        Swal.fire({
            title: "Fin de la partie",
            text: "Vainqueur : " + data.winner,
            color: "#FFF",
            confirmButtonText: "Fin de la partie",
            customClass: {
                popup: 'glassmorph',
            },
            background: "url('/images/swal_bg.png')"
        }).then(() => window.location.href = window.location.origin);
    }
});

channel.bind('player-ack-ready', (data) => {
    readyPlayersCount++;
    $("li[data-pseudo='" + data.pseudo + "']").removeClass("not-ready").addClass("ready");

    if (iAmMaster && readyPlayersCount >= totalPlayersInRoom) {
        console.log("Tout le monde est prêt, lancement du round !");
        readyPlayersCount = 0;
        $.ajax({
            url: urls.round_launch,
            method: 'POST'
        });
    }
});

channel.bind('launch', () => {
    const hasInteracted = localStorage.getItem('userInteractedWithMedia') === 'true';
    if (hasInteracted) {
        localStorage.setItem('userInteractedWithMedia', 'false');

        player.unMute();
        player.setVolume(100);
        $("#countdown").css("color", "var(--success)");
        $("#timer").css("border-color", "var(--success)");
        player.playVideo();
    }
});

channel.bind('player-buzzed', (data) => {
    if (timerPaused) return;

    player.pauseVideo();
    timerPaused = true;

    if (iAmMaster) {
        Swal.fire({
            title: "Buzz de " + data.pseudo,
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
    }
});

channel.bind('validation', (data) => {
    if (data.isValid === 'true') {
        if (iAmMaster) {
            const scoreInfo = $(`#player-${data.token} #score`);
            const score = Number(scoreInfo.text()) + Number(videos[current].points);
            scoreInfo.text((''+score).padStart(3, '0'));
        }

        answerGiven = true;
        player.playVideo();
    } else {
        timerPaused = false;
        player.playVideo();
    }
});

channel.bind('player-ack-finish', (data) => {
    readyPlayersCount++;
    $("li[data-pseudo='" + data.pseudo + "']").removeClass("not-ready").addClass("ready");

    if (iAmMaster && readyPlayersCount >= totalPlayersInRoom) {
        $(".btn-next").removeClass("disabled");
        showSuccessToast('Vous pouvez lancer le prochain round');
    }
});