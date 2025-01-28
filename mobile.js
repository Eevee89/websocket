$(document).ready(async () => {
    $("#submit").click(() => {
        let pseudo = $("#name").val();
        conn.send("NEWPLAYER "+pseudo);
        $("#submit").hide();
    })
});