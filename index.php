<?php
session_start();
$_SESSION["LOGGED"] = false;
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blind Test Online</title>
    <meta name="description" content="Wanna play blind test with some friends ?">
    <link rel="icon" type="image/svg+xml" href="images/audio.svg">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pnotify/dist/pnotify.min.css">
    <link id="style-link" rel="stylesheet" href="styles.css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="https://cdn.jsdelivr.net/npm/pnotify/dist/pnotify.min.js"></script>
    <script src="js/functions.js"></script>
    <script src="js/client.js"></script>
</head>
</html>

<?php if ($_SESSION["LOGGED"] || $_SERVER['REQUEST_METHOD'] == 'POST'): ?>
    <?php $_SESSION["LOGGED"] = true; ?>
    <?php if ($_POST["action"] === "Créer"): ?>
        <?= include "php/master.php"; ?>
    <?php else: ?>
        <?= include "php/player.php"; ?>
    <?php endif; ?>

<?php else: ?>
    <div id="connBody" class="fakeBody">
        <p id="notconnected" style="color: red;"> Erreur de connexion au serveur </p>
        <form id="connBox" class="box" method="POST" action="">
            <input type="text" id="pseudoInput" name="pseudo" placeholder="Entrez votre pseudo"/>
            <div id="connBtns">
                <input type="submit" name="action" id="createRoom" value="Créer"/> 
                <input type="submit" name="action" id="joinRoom" value="Rejoindre"/>
            </div>
        </form>
        <div id="sepconn" style="width: 1px; height: 20px;"></div>
        <button id="rules">Comment jouer ?</button>
    </div>
<?php endif; ?>