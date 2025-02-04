<?php
$userAgent = $_SERVER['HTTP_USER_AGENT'];

$isMob = is_numeric(strpos(strtolower($_SERVER["HTTP_USER_AGENT"]), "mobile"));
$isios = stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false || stripos($userAgent, 'iPod') !== false;
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

<?php 

if ($isMob) {
    include "php/player.php";
} else {
    include "php/master.php";
}