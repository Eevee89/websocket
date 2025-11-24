$(document).ready(() => {
    if ($("#playersReady").css("display") === "none") {
        $(".dashboard").addClass("row justify-content-around align-items-end p-3").removeClass("tab-content");
        $(".dashboard-col").addClass("col-3").removeClass("tab-pane fade show active m-2");
    } else {
        $(".dashboard").addClass("tab-content").removeClass("row justify-content-around align-items-end p-3");
        $(".dashboard-col").addClass("tab-pane fade show active m-2").removeClass("col-3");
    }

    $(".btn-ready").click(() => {
        if ($(this).hasClass("disabled")) {
            return;
        }

        const message = JSON.stringify({
            "route": "room/ready",
            "datas": {
                "room": thisRoom,
                "color": $("#selectedColor").data("value"),
                "buzzer": $("#selectedBuzzer").data("value"),
                "team": $("#teamInput").val() || ""
            }
        });

        window.mySocket.send(message);
        console.log("SEND: " + message);

        showSuccessToast("Joueur prêt");
    });
});

$(document).on("click", ".btn-sound", (event) => {
    const parent = $(event.target).closest(".big-round");
    const id = parent.data("id");
    $("audio")[id].play();
    $("#selectedBuzzer").data("value", id).text(id + 1);
    
    if ($("#selectedColor").data("value")) {
        $(".btn-ready").removeClass("disabled");
    }
});

$(document).on("click", ".btn-color", (event) => {
    const color = $(event.target).data("color");
    $("#selectedColor").data("value", color).css("background-color", color);

    if ($("#selectedBuzzer").data("value") > -1) {
        $(".btn-ready").removeClass("disabled");
    }
});