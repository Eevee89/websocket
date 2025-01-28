function onPlayerError(event) {
    console.log('Error occurred: ' + event.data);
    // Handle the error, e.g., display an error message, retry, etc.
}

let index = 0;
var player;

$(document).ready(() => {
    $('#fakeIframe').css("width", $('iframe').width() + 'px');
    $('#fakeIframe').css("height", $('iframe').height() + 'px');

    var opt = {
        height: '360',
        width: '640',
        videoId: videosIds[index++],
        events: {
          'onError': onPlayerError
        }
    }

    player = new YT.Player('player', opt);

    $("#player").hide();
    $(".loader").hide();
    $("#progressLbl").text("Musique " + zeroPad(index, 2) + "/" + zeroPad(videosIds.length, 2));
});

$(document).on("click", "#timer", async () => {
    player.playVideo();
    seconds = hideTime;
    let colors = gradientColorsCompute(seconds);
    let intervalId = setInterval(() => {
        $("#countdown").css("color", colors[hideTime-seconds]);
        $("#timer").css("border-color", colors[hideTime-seconds]);
        $("#countdown").text(seconds--);
  
        if (seconds === -1) {
            clearInterval(intervalId);
            $("#fakeIframe").hide();
            $("#player").show();
            $(".loader").show();
            $(".loader").css("animation", "l6 "+showTime+"s 1");
        }
    }, 1000);
});

$(document).on("animationend", ".loader", async () => {
    $(".loader").css("animation", "");
    $("#player").hide();

    if (player) {
        player.stopVideo();
        player.destroy();
    }

    if (index < videosIds.length) {
        var opt = {
            height: '360',
            width: '640',
            videoId: videosIds[index++],
            events: {
            'onError': onPlayerError
            }
        }
    
        player = new YT.Player('player', opt);
        $("#player").hide();
        $("#fakeIframe").show();
        $("#playBtn").hide();
        $("#countdown").text(hideTime);
        $(".loader").hide();
        await delay(1000);
        $("#timer").click();
        $("#progressLbl").text("Musique " + zeroPad(index, 2) + "/" + zeroPad(videosIds.length, 2));
    }
});