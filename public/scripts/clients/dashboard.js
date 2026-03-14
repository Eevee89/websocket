channel.bind('room-join', (event) => {
    const player = event.info;

    $("#playerList").append(generatePlayerListItem(player.pseudo, player.team, player.color));
    $("#playerGameList").append(generatePlayerListItem(player.pseudo, player.team, player.color));
    $(".btn-go").addClass("disabled");
});

channel.bind('room-ready', (data) => {
    if (iAmMaster) {
        const player = $("li[data-pseudo='" + data.pseudo + "']");
        player.find(".round").css("background-color", data.color);
        player.find(".info-span").text(`[${datas.team}] ${data.pseudo}`)
        player.removeClass("not-ready").addClass("ready").data("color", data.color);

        if (everyoneReady()) {
            $(".btn-go").removeClass("disabled");
        }
    } else {
        console.log(data);
    }
});