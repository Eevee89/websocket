let totalPlayersInRoom = 0;

channel.members.each((member) => {
    if (!member.info.isMaster) {
        totalPlayersInRoom++;
    }
});

channel.bind('round-ready', (data) => {
    videoCount = data.count;
    HIDE = data.hide;
    if (!iAmMaster) {
        buildPlayer(data.videoId);
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
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: Appeler une route API pour ajouter les points au serveur
                updateScore(data.token, videos[current].points);
                answerGiven = true;
            } else {
                timerPaused = false;
                player.playVideo();
                // TODO: Envoyer un event pour dire au joueur "Faux, tu es bloqué"
            }
        });
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