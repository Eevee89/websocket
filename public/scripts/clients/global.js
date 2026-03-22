const pusher = new Pusher(pusherKey, {
    cluster: 'eu',
    authEndpoint: urls.pusher_auth
});

const channel = pusher.subscribe(`presence-room-${thisRoom}`);

channel.bind_global((eventName, data) => {
    console.log("Événement reçu : " + eventName, data);
});

const playersId = [];

// ARRIVAL

channel.bind('pusher:subscription_succeeded', (event) => {
    console.log("Liste initiale des joueurs :", event.members);
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

    $(".btn-go").toggleClass("disabled", !everyoneReady());
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

    $(".btn-go").toggleClass("disabled", !everyoneReady());
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
        showErrorSwal(
            "Connexion perdue",
            "Pusher ne parvient pas à vous reconnecter.\nVous serez rediriger à l'accueil",
            () => { window.location.href = "/"; }
        );
    }
});