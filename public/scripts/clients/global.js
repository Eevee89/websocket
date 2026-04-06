const pusher = new Pusher(pusherKey, {
    cluster: 'eu',
    authEndpoint: urls.pusher_auth
});

const channel = pusher.subscribe(`presence-room-${thisRoom}`);

const playersId = [];

// ARRIVAL

channel.bind('pusher:subscription_succeeded', (event) => {
    const players = event.members;
    $("#playerList").html('');
    for (const pToken in players) {
        if (pToken === event.myID) {
            continue;
        }

        playersId.push(pToken);
        
        const player = players[pToken];
        const item = generatePlayerListItem(pToken, player.pseudo, player.team, player.color, dashboard, player.score);

        if (player.ready) {
            item.removeClass("not-ready").addClass("ready");
        }

        $("#playerList").append(item);
    }

    const canGo = everyoneReady() && $('#videoList li').length > 0;
    $(".btn-go").toggleClass("disabled", !canGo);
});

channel.bind('pusher:member_added', (member) => {
    const player = member.info;
    showInfoToast(player.pseudo + " a rejoint la partie !");

    let item = null;
    if (!playersId.includes(member.id)) {
        item = generatePlayerListItem(member.id, player.pseudo, player.team, player.color);
        $("#playerList").append(item);
        playersId.push(member.id);
    } else {
        item = $('#player-' + member.id);
    }

    if (player.ready) {
        item.removeClass("not-ready").addClass("ready");
    }

    const canGo = everyoneReady() && $('#videoList li').length > 0;
    $(".btn-go").toggleClass("disabled", !canGo);
});

// DECONNECTION 

channel.bind('pusher:member_removed', (member) => {
    $(`#player-${member.id}`).remove();
    const index = playersId.indexOf(member.id);
    playersId.splice(index, 1);
    showErrorToast(`${member.info.pseudo} a quitté la partie.`);
});

pusher.connection.bind('state_change', (states) => {
    if (states.current === 'unavailable') {
        Swal.fire({
            title: "Connexion perdue",
            text: "Pusher ne parvient pas à vous reconnecter.\Vous serez redirifer à l'accueil",
            color: "#FFF",
            confirmButtonText: "OK",
            customClass: {
                popup: 'glassmorph',
            },
            background: "url('/images/swal_bg.png')"
        }).then(() => window.location.href = window.location.origin );
    }
});