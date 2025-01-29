$(document).ready(async () => {
    $("#pseudoSubmit").click(() => {
        let pseudo = $("#pseudoInput").val();
        msg = {
            "room": 10000,
            "type": "NEW PLAYER",
            "payload": pseudo
        };
        conn.send(JSON.stringify(msg));
        $("#pseudoSubmit").hide();
    })
});