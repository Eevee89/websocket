let translations = {
    "notconnected": {
        "fr": "Erreur de connexion au serveur",
        "en": "Error while connecting to server"
    },
    "pseudoInput": {
        "fr": "Entrer votre pseudo",
        "en": "Enter your pseudo"
    },
    "pseudoSubmitDesktop": {
        "fr": "Créer",
        "en": "Create"
    },
    "pseudoSubmitMobile": {
        "fr": "Rejoindre",
        "en": "Join"
    },
    "roomInput": {
        "fr": "ID de la partie",
        "en": "ID of the room"
    },
    "rules": {
        "fr": "Comment jouer ?",
        "en": "How to play ?"
    },
    "beginBtn": {
        "fr": "Commencer",
        "en": "Begin"
    },
    "hideTimeControlLabel": {
        "fr": "Temps pour deviner (sec.)",
        "en": "Time to guess (sec.)"
    },
    "showTimeControlLabel": {
        "fr": "Nombre d'essais/musique",
        "en": "Number of attempt/track"
    },
    "ttlmlabel": {
        "fr": "Nombre de musiques : ",
        "en": "Number of tracks : "
    },
    "ttltlabel": {
        "fr": "Temps total : ",
        "en": "Total time : "
    },
    "attemptlabel": {
        "fr": "Nombre d'essais : ",
        "en": "Number of attemps : "
    },
    "playerListLabel": {
        "fr": "Liste des joueurs",
        "en": "List of players"
    },
    "urlInput": {
        "fr": "Entrez une url Youtube",
        "en": "Enter a Youtube url"
    },
    "catInput": {
        "fr": "Entrez une catégorie",
        "en": "Enter a category"
    },
    "toggleBtnShow": {
        "fr": "Montrer la playlist",
        "en": "Show the playlist"
    },
    "toggleBtnHide": {
        "fr": "Cacher la playlist",
        "en": "Hide the playlist"
    },
    "firstBtn": {
        "fr": "Mettre en premier",
        "en": "Move to first"
    },
    "prevBtn": {
        "fr": "Mettre avant",
        "en": "Move before"
    },
    "nextBtn": {
        "fr": "Mettre après",
        "en": "Move ater"
    },
    "lastBtn": {
        "fr": "Mettre en dernier",
        "en": "Move to last"
    },
    "shuffleBtn": {
        "fr": "Mélanger la playlist",
        "en": "Shuffle the playlist"
    },
    "dwnldBtn": {
        "fr": "Sauvegarder la playlist",
        "en": "Download the playlist"
    },
    "uploadBtn": {
        "fr": "Importer une playlist",
        "en": "Upload a playlist"
    },
    "deleteBtnAll": {
        "fr": "Supprimer la playlist",
        "en": "Delete whole playlist"
    },
    "deleteBtnOne": {
        "fr": "Supprimer la musique",
        "en": "Delete selected track"
    },
    "gametobegin": {
        "fr": "La partie va bientôt commencer...",
        "en": "The game will begin soon..."
    },
    "colorchoice": {
        "fr": "Choisissez votre couleur",
        "en": "Choose your color"
    },
    "readyinfo": {
        "fr": "Note: Se mettre 'prêt' est définitif",
        "en": "Note: Ready state is permanent"
    }
};

function getTranslation(key, lang) {
    return translations[key][lang];
}