channel.bind('player-ready', (data) => {
    if (iAmMaster) {
        const player = $("li[data-pseudo='" + data.pseudo + "']");
        player.find(".round").css("background-color", data.color);
        player.find(".info-span").text(`[${data.team}] ${data.pseudo}`)
        player.removeClass("not-ready").addClass("ready").data("color", data.color);

        showInfoToast(data.pseudo + ' est prêt');

        const canGo = everyoneReady() && $('#videoList li').length > 0;
        $(".btn-go").toggleClass("disabled", !canGo);
    } else {
        console.log(data);
    }
});

channel.bind('player-kicked', (data) => {
    if (!iAmMaster && data.token === token) {
        Swal.fire({
            title: "Attention",
            text: "Vous avez été exclu de la salle par le maître du jeu.\nVous allez être rediriger vers la page d'accueil.",
            showCancelButton: false,
            confirmButtonText: "OK",
            color: "#FFF",
            customClass: {
                popup: 'glassmorph',
            },
            background: "url('/images/swal_bg.png')"
        }).then(() => {
            window.location.href = "/";
        });
    } else {
        console.log(data);
    }
});

channel.bind('game-start', () => {
    if (!iAmMaster) {
        window.location.href = urls.game_page;
    } else {
        console.log('Game start !');
    }
});