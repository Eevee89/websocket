<?php
$userAgent = $_SERVER['HTTP_USER_AGENT'];

$isMob = is_numeric(strpos(strtolower($_SERVER["HTTP_USER_AGENT"]), "mobile"));
$isios = stripos($userAgent, 'iPhone') !== false || stripos($userAgent, 'iPad') !== false || stripos($userAgent, 'iPod') !== false;
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Blind Test</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pnotify/dist/pnotify.min.css">
    <link id="style-link" rel="stylesheet" href="styles.css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="https://cdn.jsdelivr.net/npm/pnotify/dist/pnotify.min.js"></script>
    <script src="functions.js"></script>
    <script src="client.js"></script>
</head>
</html>

<?php 

if ($isMob) {
    include "mobile.php";
} else {
    include "desktop.php";
}