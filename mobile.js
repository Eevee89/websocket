$(document).ready(async () => {
    $("#sepconn").hide();
    $("#notroom").hide();
    $("#waitBody").hide();

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
        let roomInput = parseInt($("#roomInput").val());
        msg = {
            "room": roomInput,
            "type": "NEW PLAYER",
            "payload": pseudo
        };
        conn.send(JSON.stringify(msg));
        $("#waitBody").show();
        $("#connBody").hide();
    });

    $(".colorTile").click((event) => {
        hex = $(event.target).css("background-color")
        $("#readySubmit").css("border-color", hex);
    })
});