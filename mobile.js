$(document).ready(async () => {
    $("#submit").click(() => {
        let pseudo = $("#name").val();
        msg = {
            "room": 10000,
            "type": "NEW PLAYER",
            "payload": pseudo
        };
        conn.send(JSON.stringify(msg));
        $("#submit").hide();
    })
});