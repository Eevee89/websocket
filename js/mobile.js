$(document).ready(async () => {
    $("#sepconn").hide();
    $("#waitBody").hide();
    $("#gameBody").hide();
    $("#connBody").show();

    colors= [
        { name: "pink", hex: "#fe447d"},
        { name: "orange", hex: "#f78f2e"},
        { name: "yellow orange", hex: "#fedc0c"},
        { name: "lime green", hex: "#d1f20a"},
        { name: "emerald green", hex: "#5cd05b"},
        { name: "teal", hex: "#03c1cd"},
        { name: "blue", hex: "#0e10e6"},
        { name: "violet", hex: "#9208e7"},
        { name: "red orange", hex: "#f84c00"},
        { name: "yellow", hex: "#f3f354"}
    ];

    for(const element of colors) {
        createColorItem(element.name, element.hex)
    }

    $("#pseudoSubmit").click(() => {
        if (!verifyInput($("#pseudoInput").val(), "Pseudo")) {
            new PNotify({
                title: 'Pseudo invalide',
                text: 'Le pseudo est trop long (max 15) ou contient des caractères interdits : <>{}!?/\\\'\"$@',
                type: 'warning',
                delay: 3000
            });
            return;
        }
        if (!verifyInput($("#roomInput").val(), "Room")) {
            new PNotify({
                title: 'ID de partie invalide',
                text: "L'id de partie doit être un entier entre 10'000 et 99'999 compris",
                type: 'warning',
                delay: 3000
            });
            return;
        }
        let pseudo = $("#pseudoInput").val();
        myPseudo = pseudo;
        let roomInput = parseInt($("#roomInput").val());
        msg = {
            "room": roomInput,
            "type": "NEW PLAYER",
            "payload": pseudo
        };
        conn.send(JSON.stringify(msg));
    });

    $("#rules").click(() => { showRules(); });

    $(".colorTile").click((event) => {
        hex = $(event.target).css("background-color")
        $("#readyBtn").css("border-color", hex);
        $("#buzBtn").css("border-color", hex);
    });

    $("#readyBtn").click(() => {
        $("#readyBtn").hide();
        hex = $("#readyBtn").css("border-color");
        msg = {
            "room": room,
            "type": "READY",
            "payload": hex
        };
        conn.send(JSON.stringify(msg));
    });

    $("#quitBtn").click(() => {
        msg = {
            "room": room,
            "type": "CLIENT GONE",
            "payload": ""
        };
        conn.send(JSON.stringify(msg));
        $("#waitBody").hide();
        $("#connBody").show();
    });

    $("#buzBtn").click(() => {
        timerPaused = true;
        $("#buzBtn").hide();
        msg = {
            "room": room,
            "type": "BUZZER",
            "payload": ""
        };
        conn.send(JSON.stringify(msg));
    });
});

$(document).on("click", "#timer", async () => {
    seconds = hideTime;
    let colors = gradientColorsCompute(seconds);
    let intervalId = setInterval(() => {
        if (timerStop) {
            clearInterval(intervalId);
            $("#timer").hide();
            $("#buzBtn").hide();
        }
        if (!timerPaused && !timerStop) {
            $("#countdown").css("color", colors[hideTime-seconds]);
            $("#timer").css("border-color", colors[hideTime-seconds]);
            $("#countdown").text(seconds--);
    
            if (seconds === -1) {
                clearInterval(intervalId);
                $("#timer").hide();
                $("#buzBtn").hide();
            }
        }
    }, 1000);
});