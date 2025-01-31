function onPlayerError(event) {
    console.log('Player error occurred: ' + event.data);
}

let index = 0;

$(document).ready(async () => {
    $("#connBody").show();
    $("#mainBody").hide();
    $("#gameBody").hide();

    for(const item of videosIds) {
        await createVideoItem(item, videosIds.indexOf(item));
    }

    $("#pseudoSubmit").click(() => {
        let pseudo = $("#pseudoInput").val();
        msg = {
            "room": 0,
            "type": "CREATEROOM",
            "payload": pseudo
        };
        conn.send(JSON.stringify(msg));
        $("#submit").hide();
        $("#connBody").hide();
        $("#mainBody").show();
    })

    $("#firstBtn").hide();
    $("#prevBtn").hide();
    $("#nextBtn").hide();
    $("#lastBtn").hide();
    $("#catForm").hide();
    $("#urlForm").show();
    $("#player").hide();
    $("#testplayer").hide();
    $("#beginBtn").hide();

    $("#ttltlabel").text("Temps total : "+formatTime());
    $("#ttlmlabel").text("Nombre de musiques : "+videosIds.length);

    $("#btcm5").click(() => {
        let blindtime = parseInt($("#btcvalue").text()) -5;
        if (blindtime < 0) blindtime = 0;
        $("#btcvalue").text(""+blindtime);

        $("#ttltlabel").text("Temps total : "+formatTime());
    });
    $("#btcp5").click(() => {
        let blindtime = parseInt($("#btcvalue").text()) +5;
        $("#btcvalue").text(""+blindtime);

        $("#ttltlabel").text("Temps total : "+formatTime());
    });

    $("#rtcm5").click(() => {
        let revealtime = parseInt($("#rtcvalue").text()) -5;
        if (revealtime < 0) revealtime = 0;
        $("#rtcvalue").text(""+revealtime);

        $("#ttltlabel").text("Temps total : "+formatTime());
    });
    $("#rtcp5").click(() => {
        let revealtime = parseInt($("#rtcvalue").text()) +5;
        $("#rtcvalue").text(""+revealtime);

        $("#ttltlabel").text("Temps total : "+formatTime());
    });

    $("#addBtn").click(async () => {
        let url = $("#urlInput").val();
        $("#urlInput").val("");
        let id = getYoutubeId(url);
        let cont = true;
        if (id && !videosIds.includes(id) && !rejectedIds.includes(id)) {
            let player2 = new YT.Player('testplayer', {
                height: '360',
                width: '640',
                videoId: id,
                events: {
                  'onError': () => { 
                    cont = false;
                    rejectedIds.push(id);
                    new PNotify({
                        title: 'Désolé',
                        text: 'La vidéo ne peut pas être intégrée.',
                        type: 'warning',
                        delay: 3000
                    });
                },
                }
            });

            await delay(1000);
            player2.destroy();

            if (cont) {
                let index = videosIds.length;
                videosIds.push(id);
                await createVideoItem(id, index);
                $("#ttlmlabel").text("Nombre de musiques : "+videosIds.length);
                $("#ttltlabel").text("Temps total : "+formatTime());
            }
        }
        else {
            new PNotify({
                title: 'Erreur',
                text: "La vidéo a déjà été ajoutée ou n'existe pas",
                type: 'warning',
                delay: 3000
            });
        }

        $("#firstBtn").hide();
        $("#prevBtn").hide();
        $("#nextBtn").hide();
        $("#lastBtn").hide();
        $("#toggleBtn").show();
        $("#catForm").hide();
        $("#urlForm").show();

        for(i=0; i<$("#videoList").children().length; i++) {
            $($("#videoList").children()[i]).removeClass("selected");
        }

        selectedItem = null;
    });

    $("#toggleBtn").click(() => {
        if ($("#toggleBtn").attr('src').includes("shown")) {
            $("#toggleBtn").attr({src: "hidden.png", srcset: "hidden.svg"});
        }
        else {
            $("#toggleBtn").attr({src: "shown.png", srcset: "shown.svg"});
        }
        $("#videoList").toggle();
    });

    $("#deleteBtn").click(() => {
        console.log(selectedItem);
        if(selectedItem) {
            videosIds.splice(videosIds.indexOf(selectedItem), 1);
            $("li").remove("#"+selectedItem);
            $("#firstBtn").hide();
            $("#prevBtn").hide();
            $("#nextBtn").hide();
            $("#lastBtn").hide();
            $("#toggleBtn").show();
            $("#catForm").hide();
            $("#urlForm").show();

            selectedItem = null;
        }
        else {
            videosIds = [];
            $("li").remove();
        }
    });

    $("#firstBtn").click(async () => {
        $("#videoList").empty();

        let index = videosIds.indexOf(selectedItem);
        videosIds.splice(index, 1);
        videosIds.unshift(selectedItem);

        for(const item of videosIds) {
            await createVideoItem(item, videosIds.indexOf(item));
        }
    });

    $("#prevBtn").click(async () => {
        $("#videoList").empty();

        let index = videosIds.indexOf(selectedItem);
        let tmp = videosIds[index-1];
        videosIds[index-1] = selectedItem;
        videosIds[index] = tmp;

        for(const item of videosIds) {
            await createVideoItem(item, videosIds.indexOf(item));
        }
    });

    $("#nextBtn").click(async () => {
        $("#videoList").empty();

        let index = videosIds.indexOf(selectedItem);
        let tmp = videosIds[index+1];
        videosIds[index+1] = selectedItem;
        videosIds[index] = tmp;

        for(const item of videosIds) {
            await createVideoItem(item, videosIds.indexOf(item));
        }
    });

    $("#lastBtn").click(async () => {
        $("#videoList").empty();

        let index = videosIds.indexOf(selectedItem);
        videosIds.splice(index, 1);
        videosIds.push(selectedItem);

        for(const item of videosIds) {
            await createVideoItem(item, videosIds.indexOf(item));
        }
    });

    $("#catBtn").click(() => {
        customInfos[selectedItem]["category"] = $("#catInput").val();
        $("#catInput").val("");
    });

    $("#beginBtn").click(async () => {
        hideTime = parseInt($("#btcvalue").text());
        showtime = parseInt($("#rtcvalue").text());
        index = 0;

        msg = {
            "room": room,
            "type": "BEGIN GAME",
            "payload": videosIds.length+";"+hideTime+";"+showtime
        };
        conn.send(JSON.stringify(msg));

        for(const pseudo of Object.keys(players)) {
            createPlayerItem(players[pseudo], pseudo);
        }
        $("#countdown").text(hideTime);
        $("#mainBody").hide();
        $("#gameBody").show();
        $("#customVideoTitle").hide();
        $("#catInfoInnerText").text(customInfos[videosIds[index]]["category"]);
        var opt = {
            height: '360',
            width: '640',
            videoId: videosIds[index++],
            events: {
              'onError': onPlayerError
            }
        }
    
        player = new YT.Player('player', opt);
        await delay(100);
        $("#timer").show();
        $("#timer").click();
        $("#catInfo").show();
        $("#progressLbl").text("Musique 01/" + zeroPad(videosIds.length, 2));
    });

    $("#nextVidBtn").click(async () => {
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
            timerStop = false;
            timerPaused = false;
            $("#player").hide();
            $("#customVideoTitle").hide();
            $("#fakeIframe").show();
            $("#playBtn").hide();
            $("#countdown").text(hideTime);
            await delay(1000);
            msg = {
                "room": room,
                "type": "CONTINUE GAME",
                "payload": index
            };
            conn.send(JSON.stringify(msg));
            $("#timer").click();
            $("#catInfoInnerText").text("Catégorie : "+customInfos[videosIds[index-1]]["category"]);
            $("#catInfo").show();
            $("#progressLbl").text("Musique " + zeroPad(index, 2) + "/" + zeroPad(videosIds.length, 2));
        }
        else {
            $("#player").hide();
            const sortedPlayers = Object.entries(players) 
                                        .sort((a, b) => b[1].score - a[1].score) 
                                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
            const best = Object.keys(sortedPlayers)[0];

            alert("La partie est finie.\nLe joueur "+ best +" est le vainqueur");

            msg = {
                "room": room,
                "type": "END GAME",
                "payload": best
            };
            conn.send(JSON.stringify(msg));
            $("#firstBtn").hide();
            $("#prevBtn").hide();
            $("#nextBtn").hide();
            $("#lastBtn").hide();
            $("#catForm").hide();
            $("#urlForm").show();
            $("#player").hide();
            $("#testplayer").hide();
            $("#beginBtn").hide();
            $("#mainBody").show();
            $("#gameBody").hide();

            for (const p of Object.keys(players)) {
                $("#"+p).remove();
                $("#player"+p).remove();
                players[p]["score"] = 0;
            }

            readies = 0;
        }
    });

    $('#fakeIframe').css("width", $('iframe').width() + 'px');
    $('#fakeIframe').css("height", $('iframe').height() + 'px');

    $("#progressLbl").text("Musique " + zeroPad(index, 2) + "/" + zeroPad(videosIds.length, 2));
});

$(document).on("click", "img", function(event) {
    const id = event.target.id;
    if(!id.includes("Btn")) {
        window.open("https://www.youtube.com/watch?v="+id, '_blank').focus();
    }
});

$(document).on("change", "input", function(event) {
    const id = event.target.id;
    if(id !== "urlInput" && id !== "catInput" && id !== "pseudoInput") {
        customInfos[id]["title"] = event.target.value;
    }
});

$(document).on("click", "li", function(event) {
    let elt = event.target;
    let li;
    if (elt.tagName === "H3" || $(elt).hasClass("imgCont")) {
        li = $(elt).parent().parent();
    }
    else if (elt.tagName === "INPUT" || $(elt).hasClass("videoInfo")) {
        li = $(elt).parent();
    }
    else if (elt.tagName === "IMG"){
        li = $(elt).parent().parent().parent();
    }

    let isSelected = $(li[0]).hasClass("selected");

    for(i=0; i<$("#videoList").children().length; i++) {
        $($("#videoList").children()[i]).removeClass("selected");
    }

    $("#firstBtn").hide();
    $("#prevBtn").hide();
    $("#nextBtn").hide();
    $("#lastBtn").hide();
    $("#toggleBtn").show();
    $("#catForm").hide();
    $("#urlForm").show();
    

    if (!isSelected) {
        $(li[0]).addClass("selected");
        selectedItem = li[0].id;

        if (videosIds.indexOf(selectedItem) !== 0) {
            $("#firstBtn").show();
            $("#prevBtn").show();
        }
        if (videosIds.indexOf(selectedItem) !== videosIds.length-1) {
            $("#nextBtn").show();
            $("#lastBtn").show();
        }
        $("#toggleBtn").hide();
        $("#catForm").show();
        $("#urlForm").hide();
        $("#catInput").val("Catégorie : "+customInfos[selectedItem]["category"]);
    }
    else {
        $("#firstBtn").hide();
        $("#prevBtn").hide();
        $("#nextBtn").hide();
        $("#lastBtn").hide();
        $("#toggleBtn").show();
        $("#catForm").hide();
        $("#urlForm").show();

        selectedItem = null;
    }
});

$(document).on("click", ".playerTile", function(event) {
    let elt = event.target;
    let toDel;
    if (elt.tagName === "H3") {
        toDel = $(elt).text();
    } else {
        toDel = elt.id;
    }
    if (confirm("Voulez-vous supprimer "+toDel+" ?")) {
        removePlayer(pseudo);
    }
});

$(document).on("click", "#timer", async () => {
    player.playVideo();
    seconds = hideTime;
    let colors = gradientColorsCompute(seconds);
    let intervalId = setInterval(() => {
        if (timerStop) {
            clearInterval(intervalId);
            $("#fakeIframe").hide();
            $("#player").show();
            $("#customVideoTitleInnerText").text(customInfos[videosIds[index-1]]["title"]);
            $("#customVideoTitle").show();
            $("#catInfo").hide();
        }
        if (!timerPaused && !timerStop) {
            $("#countdown").css("color", colors[hideTime-seconds]);
            $("#timer").css("border-color", colors[hideTime-seconds]);
            $("#countdown").text(seconds--);
    
            if (seconds === -1) {
                clearInterval(intervalId);
                $("#fakeIframe").hide();
                $("#player").show();
                $("#customVideoTitleInnerText").text(customInfos[videosIds[index-1]]["title"]);
                $("#customVideoTitle").show();
                $("#catInfo").hide();
            }
        }
    }, 1000);
});