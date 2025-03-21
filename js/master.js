function onPlayerError(event) {
    timerPaused = true;
    timerStop = true;
    msg = {
        "room": room,
        "type": "BUZZER VALIDATION",
        "payload": 1
    };
    conn.send(JSON.stringify(msg));
    new PNotify({
        title: 'Une erreur est survenue',
        text: "La vidéo ne peut pas être lue.",
        type: 'warning',
        delay: 3000
    });
}

let index = 0;

function isPlayerReady() {
    return player && player.getPlayerState() !== -1; 
}

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

        if ($("#rightPanel").css("flex-direction") == "column") {
            $("#mtabs").show();
            $("#leftPanel").show();
            $("#rightPanel").hide();

            $("#mtab1").click(() => {
                $("#leftPanel").show();
                $("#rightPanel").hide();
                $("#mtab1").addClass("waitmenuselected");
                $("#mtab2").removeClass("waitmenuselected");
                $("#mtab3").removeClass("waitmenuselected");
            });

            $("#mtab2").click(() => {
                $("#leftPanel").hide();
                $("#rightPanel").show();
                $("#playerControlPanel").hide();
                $("#timeControlPanel").show();
                $("#mtab2").addClass("waitmenuselected");
                $("#mtab3").removeClass("waitmenuselected");
                $("#mtab1").removeClass("waitmenuselected");
            });

            $("#mtab3").click(() => {
                $("#leftPanel").hide();
                $("#rightPanel").show();
                $("#timeControlPanel").hide();
                $("#playerControlPanel").show();
                $("#mtab3").addClass("waitmenuselected");
                $("#mtab1").removeClass("waitmenuselected");
                $("#mtab2").removeClass("waitmenuselected");
            });
        }

        $("#submit").hide();
        $("#connBody").hide();
        $("#mainBody").show();
    })

    $("#rules").click(() => { showRules(); });

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
        let nbEssais = parseInt($("#rtcvalue").text()) -1;
        if (nbEssais < 1) nbEssais = 1;
        $("#rtcvalue").text(""+nbEssais);

        $("#attemptlabel").text("Nombre d'essais : "+nbEssais);
    });
    $("#rtcp5").click(() => {
        let nbEssais = parseInt($("#rtcvalue").text()) +1;
        $("#rtcvalue").text(""+nbEssais);

        $("#attemptlabel").text("Nombre d'essais : "+nbEssais);
    });

    $("#addBtn").click(async () => {
        let url = $("#urlInput").val();
        $("#urlInput").val("");
        for (const elt of $("#urlForm").children()) {
            $(elt).addClass("wip");
        }
        for (const elt of $("#catForm").children()) {
            $(elt).addClass("wip");
        }
        for (const elt of $("#otherOpt").children()) {
            $(elt).addClass("wip");
        }
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
        $("#dwnldBtn").show();
        $("#uploadBtn").show();
        $("#shuffleBtn").show();
        $("#catForm").hide();
        $("#urlForm").show();

        for(i=0; i<$("#videoList").children().length; i++) {
            $($("#videoList").children()[i]).removeClass("selected");
        }

        selectedItem = null;
        for (const elt of $("#urlForm").children()) {
            $(elt).removeClass("wip");
        }
        for (const elt of $("#catForm").children()) {
            $(elt).removeClass("wip");
        }
        for (const elt of $("#otherOpt").children()) {
            $(elt).removeClass("wip");
        }
        $("#videoList").animate({scrollTop: $("#videoList")[0].scrollHeight}, 1000);

        let nbPlayers = Object.keys(players).length;
        if (readies == nbPlayers && nbPlayers >= 2 && videosIds.length > 0) {
            $("#beginBtn").show();
        } else {
            $("#beginBtn").hide();
        }
    });

    $("#toggleBtn").click(() => {
        if ($("#toggleBtn").attr('src').includes("shown")) {
            $("#toggleBtn").attr({src: "images/hidden.png", srcset: "images/hidden.svg", title: "Montrer les vidéos"});
        }
        else {
            $("#toggleBtn").attr({src: "images/shown.png", srcset: "images/shown.svg", title: "Cacher les vidéos"});
        }
        $("#videoList").toggle();
    });

    $("#shuffleBtn").click(async () => {
        $("#videoList").empty();

        videosIds = shuffleArray(videosIds);

        for(const item of videosIds) {
            await createVideoItem(item, videosIds.indexOf(item));
        }
    });

    $("#dwnldBtn").click(() => {
        let toDownload = {};
        for(const item of videosIds) {
            toDownload[item] = customInfos[item];
        }
        let text = JSON.stringify(toDownload);
        let filename = "blindtest.json";
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    });

    $("#uploadBtn").click(() => {
        $("#fileInput").click();
    });

    $("#deleteBtn").click(() => {
        if(selectedItem) {
            videosIds.splice(videosIds.indexOf(selectedItem), 1);
            $("li").remove("#"+selectedItem);
            $("#firstBtn").hide();
            $("#prevBtn").hide();
            $("#nextBtn").hide();
            $("#lastBtn").hide();
            $("#toggleBtn").show();
            $("#dwnldBtn").show();
            $("#uploadBtn").show();
            $("#shuffleBtn").show();
            $("#catForm").hide();
            $("#urlForm").show();

            selectedItem = null;
            $("#ttlmlabel").text("Nombre de musiques : "+videosIds.length);
            $("#ttltlabel").text("Temps total : "+formatTime());
        }
        else {
            videosIds = [];
            customInfos = [];
            $("li").remove();
            $("#ttlmlabel").text("Nombre de musiques : 0");
            $("#ttltlabel").text("Temps total : 0");
        }

        let nbPlayers = Object.keys(players).length;
        if (readies == nbPlayers && nbPlayers >= 2 && videosIds.length > 0) {
            $("#beginBtn").show();
        } else {
            $("#beginBtn").hide();
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
        if (!verifyInput($("#catInput").val(), "Category")) {
            new PNotify({
                title: 'Categorie invalide',
                text: "La catégorie contient des caractères interdits : <>{}!?/\\\'\"$@",
                type: 'warning',
                delay: 3000
            });
            return;
        }
        customInfos[selectedItem]["category"] = $("#catInput").val();
        $("#catInput").val("");
        $($("#"+selectedItem).children()[1]).click()
    });

    $("#beginBtn").click(async () => {
        hideTime = parseInt($("#btcvalue").text());
        showtime = 5;
        nbEssais = parseInt($("#rtcvalue").text());
        index = 0;
        timerStop = false;
        timerPaused = false;

        msg = {
            "room": room,
            "type": "BEGIN GAME",
            "payload": videosIds.length+";"+hideTime+";"+nbEssais+";"+customInfos[videosIds[index]]["title"]+";"+videosIds[index]+";"+index
        };

        const startAt = customInfos[videosIds[index]]["start"] || 0;

        var opt = {
            height: $("#rightPanel").css("flex-direction") == "column" ? '180' : '360',
            width: $("#rightPanel").css("flex-direction") == "column" ? '720' : '640',
            videoId: videosIds[index++],
            events: {
              'onError': onPlayerError
            }
        }
    
        player = new YT.Player('player', opt);

        new Promise((resolve) => {
            const checkReadyInterval = setInterval(() => {
                if (isPlayerReady()) {
                    clearInterval(checkReadyInterval);
                    resolve();
                }
            }, 100); 
        }).then(() => {
            // Player is ready with the new video
            $("#nextVidBtn").hide();
            if ($("#rightPanel").css("flex-direction") == "column") {
                let keys = Object.keys(players);
                let m = keys.length >= 3 ? 3 : keys.length;
                for(i=0; i<m; i++) {
                    const pseudo = keys[i];
                    createPlayerItem(players[pseudo], pseudo);
                }
            } else {
                for(const pseudo of Object.keys(players)) {
                    createPlayerItem(players[pseudo], pseudo);
                }
            }
            player.seekTo(startAt);
            player.unMute();
            player.setVolume(100);
            $("#countdown").text(hideTime);
            $("#mainBody").hide();
            $("#gameBody").show();
            $("#fakeIframe").show();
            $("#player").hide();
            $("#customVideoTitle").hide();
            $("#catInfoInnerText").text(customInfos[videosIds[index-1]]["category"]);
            conn.send(JSON.stringify(msg));
            $("#timer").show();
            $("#timer").click();
            $("#catInfo").show();
            $("#progressLbl").text("Musique 01/" + zeroPad(videosIds.length, 2));
        });
    });

    $("#nextVidBtn").click(async () => {
        $("#player").hide();
        $("#nextVidBtn").hide();

        if (player) {
            player.stopVideo();
            player.destroy();
        }
    
        if (index < videosIds.length) {
            msg = {
                "room": room,
                "type": "BEGIN GAME",
                "payload": videosIds.length+";"+hideTime+";"+nbEssais+";"+customInfos[videosIds[index]]["title"]+";"+videosIds[index]+";"+index
            };

            const startAt = customInfos[videosIds[index]]["start"] || 0;

            var opt = {
                height: $("#rightPanel").css("flex-direction") == "column" ? '180' : '360',
                width: $("#rightPanel").css("flex-direction") == "column" ? '720' : '640',
                videoId: videosIds[index++],
                events: {
                    'onError': onPlayerError
                }
            }
        
            player = new YT.Player('player', opt);

            new Promise((resolve) => {
                const checkReadyInterval = setInterval(() => {
                    if (isPlayerReady()) {
                        clearInterval(checkReadyInterval);
                        resolve();
                    }
                }, 100); 
            }).then(async () => {
                // Player is ready with the new video
                const sortedPlayers = Object.entries(players) 
                                        .sort((a, b) => b[1].score - a[1].score) 
                                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
                $("#playerList").html("");
                if ($("#rightPanel").css("flex-direction") == "column") {
                    let keys = Object.keys(sortedPlayers);
                    let m = keys.length >= 3 ? 3 : keys.length;
                    for(i=0; i<m; i++) {
                        const pseudo = keys[i];
                        createPlayerItem(sortedPlayers[pseudo], pseudo);
                    }
                } else {
                    for(const pseudo of Object.keys(sortedPlayers)) {
                        createPlayerItem(sortedPlayers[pseudo], pseudo);
                    }
                }
                timerStop = false;
                timerPaused = false;
                $("#player").hide();
                player.seekTo(startAt);
                player.unMute();
                player.setVolume(100);
                $("#customVideoTitle").hide();
                $("#fakeIframe").show();
                $("#playBtn").hide();
                $("#countdown").text(hideTime);
                conn.send(JSON.stringify(msg));
                await delay(100);
                $("#timer").click();
                $("#catInfoInnerText").text("Catégorie : "+customInfos[videosIds[index-1]]["category"]);
                $("#catInfo").show();
                $("#progressLbl").text("Musique " + zeroPad(index, 2) + "/" + zeroPad(videosIds.length, 2));
            });
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

    $("#stopBtn").click(async () => {
            player.stopVideo();
            player.destroy();
            player = null;
            await delay(100);
            timerStop = true;
            index = videosIds.length;
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
    if (id !== "urlInput" && id !== "catInput" && id !== "pseudoInput" && id !== "fileInput") {
        if (!verifyInput(event.target.value, "Title")) {
            new PNotify({
                title: 'Titre invalide',
                text: "Le titre personnalisé contient des caractères interdits : <>{}!?/\\\'\"$@",
                type: 'warning',
                delay: 3000
            });
            return;
        }
        customInfos[id]["title"] = event.target.value;
    }
    if (id == "fileInput") {
        var file = this.files[0];

        if (file.type !== 'application/json') {
            new PNotify({
                title: 'Mauvaise extension',
                text: 'Le fichier doit être au format .json',
                type: 'warning',
                delay: 3000
            });
          return; 
        }

        var reader = new FileReader();

        reader.onload = async function(event) {
          try {
            customInfos = JSON.parse(event.target.result);

            if (!validateYoutubeObject(customInfos)) {
                throw new Error("Objet invalide");
            }

            videosIds = Object.keys(customInfos);

            for(const item of videosIds) {
                if (!verifyInput(customInfos[item]["title"], "Title")) {
                    new PNotify({
                        title: 'Titre invalide pour '+item,
                        text: "Le titre personnalisé contient des caractères interdits : <>{}!?/\\\'\"$@",
                        type: 'warning',
                        delay: 3000
                    });
                    videosIds = [];
                    customInfos = [];
                    throw new Error("Titre invalide");
                }
                if (!verifyInput(customInfos[item]["category"], "Category")) {
                    new PNotify({
                        title: 'Categorie invalide pour '+item,
                        text: "La catégorie contient des caractères interdits : <>{}!?/\\\'\"$@",
                        type: 'warning',
                        delay: 3000
                    });
                    videosIds = [];
                    customInfos = [];
                    throw new Error("Catégorie invalide");
                }
                if (customInfos[item]["start"]) {
                    if (!verifyInput(customInfos[item]["start"], "StartTime")) {
                        new PNotify({
                            title: 'Temps de début invalide pour '+item,
                            text: "Le temps n'est pas un entier positif",
                            type: 'warning',
                            delay: 3000
                        });
                        videosIds = [];
                        customInfos = [];
                        throw new Error("Temps invalide");
                    }
                }
                await createVideoItem(item, videosIds.indexOf(item));
            }
            $("#ttlmlabel").text("Nombre de musiques : "+videosIds.length);
            $("#ttltlabel").text("Temps total : "+formatTime());
            $("#videoList").animate({scrollTop: $("#videoList")[0].scrollHeight}, 1000);

            let nbPlayers = Object.keys(players).length;
            if (readies == nbPlayers && nbPlayers >= 2 && videosIds.length > 0) {
                $("#beginBtn").show();
            } else {
                $("#beginBtn").hide();
            }
          } catch (error) {
            new PNotify({
                title: 'Erreur',
                text: 'Erreur lors de la lecture du fichier.\n'+error,
                type: 'error',
                delay: 3000
            });
          }
        };

        reader.readAsText(file);
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
    $("#dwnldBtn").show();
    $("#uploadBtn").show();
    $("#shuffleBtn").show();
    $("#catForm").hide();
    $("#urlForm").show();
    

    if (!isSelected) {
        $("#deleteBtn").attr({title: "Supprimer la vidéo"});
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
        $("#dwnldBtn").hide();
        $("#uploadBtn").hide();
        $("#shuffleBtn").hide();
        $("#catForm").show();
        $("#urlForm").hide();
        $("#catInput").val("Catégorie : "+customInfos[selectedItem]["category"]);
    }
    else {
        $("#deleteBtn").attr({title: "Supprimer toutes les vidéos"});
        $("#firstBtn").hide();
        $("#prevBtn").hide();
        $("#nextBtn").hide();
        $("#lastBtn").hide();
        $("#toggleBtn").show();
        $("#dwnldBtn").show();
        $("#uploadBtn").show();
        $("#shuffleBtn").show();
        $("#catForm").hide();
        $("#urlForm").show();

        selectedItem = null;
    }
});

$(document).on("click", "#timer", async () => {
    player.playVideo();
    seconds = hideTime;
    showSec = showTime;
    let colors = gradientColorsCompute(seconds);
    let intervalId = setInterval(() => {
        if (timerStop) {
            clearInterval(intervalId);
            $("#fakeIframe").hide();
            $("#player").show();
            $("#customVideoTitleInnerText").text(customInfos[videosIds[index-1]]["title"]);
            $("#customVideoTitle").show();
            $("#catInfo").hide();

            let showInterval = setInterval(() => {
                if (showSec-- === -1) {
                    clearInterval(showInterval);
                    $("#nextVidBtn").show();
                }
            }, 1000);
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
                let showInterval = setInterval(() => {
                    if (showSec-- === -1) {
                        clearInterval(showInterval);
                        $("#nextVidBtn").show();
                    }
                }, 1000);
            }
        }
    }, 1000);
});