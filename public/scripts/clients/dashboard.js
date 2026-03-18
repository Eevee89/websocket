channel.bind('player-ready', (data) => {
    if (iAmMaster) {
        const player = $("li[data-pseudo='" + data.pseudo + "']");
        player.find(".round").css("background-color", data.color);
        player.find(".info-span").text(`[${data.team}] ${data.pseudo}`)
        player.removeClass("not-ready").addClass("ready").data("color", data.color);

        showInfoToast(data.pseudo + ' est prêt');

        $(".btn-go").toggleClass("disabled", !everyoneReady());
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
            color: "var(--dark)",
            customClass: {
                confirmButton: "striped-warning-light",
            },
            background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
        }).then(() => {
            window.location.href = "/";
        });
    } else {
        console.log(data);
    }
});