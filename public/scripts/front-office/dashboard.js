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

        $.ajax({
            url: urls.room_ready,
            method: 'POST',
            data: {
                "room": thisRoom,
                "pseudo": pseudo,
                "color": $("#selectedColor").data("value"),
                "buzzer": $("#selectedBuzzer").data("value"),
                "team": $("#teamInput").val() || ""
            }
        })
        .done(function () {
            showSuccessToast("Joueur prêt");
        })
        .fail(function (xhr) {
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "Erreur serveur";
            showErrorSwal("Impossible de supprimer ce joueur", errorMsg);
        });
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