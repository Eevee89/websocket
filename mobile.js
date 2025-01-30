let index = 0;

$(document).ready(async () => {
    $("#sepconn").hide();
    $("#notroom").hide();
    $("#waitBody").hide();
    $("#gameBody").hide();
    $(".loader").hide();

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

    $(".colorTile").click((event) => {
        hex = $(event.target).css("background-color")
        $("#readyBtn").css("border-color", hex);
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
});

$(document).on("click", "#timer", async () => {
    seconds = hideTime;
    let colors = gradientColorsCompute(seconds);
    let intervalId = setInterval(() => {
        $("#countdown").css("color", colors[hideTime-seconds]);
        $("#timer").css("border-color", colors[hideTime-seconds]);
        $("#countdown").text(seconds--);
  
        if (seconds === -1) {
            clearInterval(intervalId);
            $("#timer").hide();
            $(".loader").show();
            $(".loader").css("animation", "l6 "+showTime+"s 1");
        }
    }, 1000);
});

$(document).on("animationend", ".loader", async () => {
    $(".loader").css("animation", "");

    if (index < nbVids) {
        
        $(".loader").hide();
        $("#countdown").text(hideTime);
        await delay(1000);
        $("#timer").click();
        $("#progressLbl").text("Musique " + zeroPad(++index, 2) + "/" + zeroPad(nbVids, 2));
    }
    else {
        $(".loader").hide();
    }
});