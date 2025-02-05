$(document).ready(async () => {
    $("#waitBody").hide();
    $("#gameBody").hide();
    $("#connBody").show();

    let soundclickable = true;

    colors= [
        { name: "pink", hex: "#fe447d"},
        { name: "orange", hex: "#f78f2e"},
        { name: "yellow_orange", hex: "#fedc0c"},
        { name: "lime_green", hex: "#d1f20a"},
        { name: "emerald_green", hex: "#5cd05b"},
        { name: "teal", hex: "#03c1cd"},
        { name: "blue", hex: "#0e10e6"},
        { name: "violet", hex: "#9208e7"},
        { name: "red_orange", hex: "#f84c00"},
        { name: "yellow", hex: "#f3f354"},
        { name: "red", hex: "#ff0000" }, 
        { name: "purple", hex: "#800080" },
        { name: "brown", hex: "#8B4513" },
        { name: "gold", hex: "#FFD700" }, 
        { name: "silver", hex: "#C0C0C0" } 
    ];

    sounds = [
        "amongus", "anime_wow", "auughhh", "chocapic", "discord_notif", 
        "error_xp", "fart", "goofy_run", "meow", "pew", 
        "pornhub", "rizz", "roblox_death", "sncf", "uwu"
    ];

    for(const element of colors) {
        createColorItem(element.name, element.hex);
    }

    for(i=0; i<15; i++) {
        createSoundItem(sounds[i], i);
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
        $(".soundTile").css("background-color", hex);
    });

    $(".soundTile").click(async (event) => {
        if (soundclickable) {
            soundclickable = false;
            let sound = event.target.id;
            var soundclick = document.getElementById(sound+"Audio");
            let duration = Math.ceil(soundclick.duration *1000);
            buzzerSound = sound+"Audio";
            let number = sounds.indexOf(sound)+1;
            $("#buzzerSoundInfoLabel").text("Buzzer n°"+number);
            $("#buzzerSoundInfo").show();
            soundclick.play();
            await delay(duration);
            soundclickable = true;
        }
    });

    $("#readyBtn").click(() => {
        $("#clearready").hide();
        hex = $("#readyBtn").css("border-color");
        msg = {
            "room": room,
            "type": "READY",
            "payload": hex
        };
        conn.send(JSON.stringify(msg));
    });

    $("#clearBtn").click(() => {
        buzzerSound = "";
        $("#readyBtn").css("border-color", "#222");
        $(".soundTile").css("background-color", "#222");
        $("#buzzerSoundInfo").hide();
    });

    if (!($("#colorList").css("display") == "flex" && $("#soundList").css("display") == "flex")) {
        $("#soundList").hide();

        $("#tab1").click(() => {
            $("#tab1").addClass("waitmenuselected");
            $("#tab2").removeClass("waitmenuselected");
            $("#soundList").hide();
            $("#colorList").show();
        });
    
        $("#tab2").click(() => {
            $("#tab2").addClass("waitmenuselected");
            $("#tab1").removeClass("waitmenuselected");
            $("#colorList").hide();
            $("#soundList").show();
            $("#soundList").css("display", "flex");
        });
    } else {
        $("#tab1").removeClass("waitmenuselected");
    }

    $("#quitBtn").click(() => {
        msg = {
            "room": room,
            "type": "CLIENT GONE",
            "payload": ""
        };
        conn.send(JSON.stringify(msg));
        $("#waitBody").hide();
        $("#connBody").show();
        $("#readyBtn").show();
    });

    $("#buzBtn").click(() => {
        if (customNbEssais != 0) {
            let answ = $("#answerInput").val() ?? "";
            if (!verifyInput(answ, "Answer")) {
                new PNotify({
                    title: 'Réponse invalide',
                    text: "La réponse contient des caractères interdits : <>{}!?/\\\'\"$@",
                    type: 'warning',
                    delay: 3000
                });
                return;
            }
            timerPaused = true;
            $("#buzCont").hide();
            msg = {
                "room": room,
                "type": "BUZZER",
                "payload": answ
            };
            conn.send(JSON.stringify(msg));
            if (buzzerSound != "") {
                var soundclick = document.getElementById(buzzerSound);
                soundclick.play();
            }
            customNbEssais -= 1;
        }
    });
});

$(document).on("click", "#timer", async () => {
    seconds = hideTime;
    let colors = gradientColorsCompute(seconds);
    let intervalId = setInterval(() => {
        if (timerStop) {
            clearInterval(intervalId);
            $("#timer").hide();
            $("#buzCont").hide();
            $("#mainMobile").hide();
            $("#ansTitle").text(customTitle);
            $("#ansCont").show();
        }
        if (!timerPaused && !timerStop) {
            $("#countdown").css("color", colors[hideTime-seconds]);
            $("#timer").css("border-color", colors[hideTime-seconds]);
            $("#countdown").text(seconds--);
    
            if (seconds === -1) {
                clearInterval(intervalId);
                $("#timer").hide();
                $("#buzCont").hide();
                $("#mainMobile").hide();
                $("#ansTitle").text(customTitle);
                $("#ansCont").show();
            }
        }
    }, 1000);
});