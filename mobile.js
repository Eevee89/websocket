$(document).ready(async () => {
    $("#pseudoSubmit").click(() => {
        let pseudo = $("#pseudoInput").val();
        let roomInput = parseInt($("#roomInput").val());
        msg = {
            "room": roomInput,
            "type": "NEW PLAYER",
            "payload": pseudo
        };
        conn.send(JSON.stringify(msg));
    });

    $("#notroom").hide();
});