<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Blind Test</title>
    <link id="style-link" rel="stylesheet" href="styles.css"/>
    <link id="style-link" rel="stylesheet" href="loader.css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script src="functions.js"></script>
    <script src="game.js"></script>
</head>
</html>

<body id="gameBody">
    <div id="header">
        <h1 id="roomId">Room 00000</h1>
        <h1 id="progressLbl">Musique 01/20</h1>
    </div>

    <div id="main">
        <div id="leftPanel">
            <div id="videoCont">
                <div id="fakeIframe">
                    <div id="timer">
                        <div id="countdown">10</div>
                    </div>
                </div>

                <div id="player"></div>
            </div>
            <div id="optCont">
              <div class="loader"></div>
            </div>
        </div>
    
        <div id="rightPanel">
            <div id="subRightPanel" class="box">
                <div id="playerListCont">
                    <ul id="playerList">
                    </ul>
                </div>
            </div>
        </div>
    </div>
</body>