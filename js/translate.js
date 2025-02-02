let translations = {
    "notconnected": {
        "fr": "Erreur de connexion au serveur",
        "en": "Error while connecting to server"
    },
    "pseudoInput": {
        "fr": "Entrer votre pseudo",
        "en": "Enter your pseudo"
    },
    "pseudoSubmit": {
        "fr": "Créer",
        "en": "Create"
    },
    "rules": {
        "fr": "Règles",
        "en": "Rules"
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
        "fr": "Temps entre chaque (sec.)",
        "en": "Time between each (sec.)"
    }
};

function getTranslation(key, lang) {
    return translations[key][lang];
}