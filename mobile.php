<body>
    <div id="connBody" class="fakeBody">
    <   <p id="notconnected" style="color: red;"> Erreur de connnexion au serveur </p>
        <div id="connBox" class="box">
            <input type="text" id="pseudoInput" name="pseudo" placeholder="Entrez votre pseudo"/>
            <input type="number" id="roomInput" name="room" placeholder="ID de la partie" min="10000" max="99999"/>
            <button id="pseudoSubmit">Rejoindre</button>
        </div>
        <div id="sepconn" style="width: 1px; height: 20px;"></div>
        <p id="notroom" style="color: red;"> La partie n'existe pas </p>
    </div>

    <div id="waitBody" class="fakeBody">
        <div id="header">
            <h2 id="roomId">Room 00000</h1>
        </div>
        
        <p> La partie va bientôt commencer... </p>
        <div style="width: 1px; height: 20px;"></div>
        <div id="colorBox" class="box">
            <p> Choisissez votre couleur </p>
            <div id="colorList">

            </div>
        </div>
        <div style="width: 1px; height: 20px;"></div>
        <button id="readyBtn">Prêt ?</button>
        <div style="width: 1px; height: 20px;"></div>
        <p> Note: Se mettre 'prêt' est définitif </p>
        <div style="width: 1px; height: 20px;"></div>
        <button id="quitBtn">Quitter</button>
    </div>

    <div id="gameBody" class="fakeBody">
        <div id="header">
            <h2 id="roomId2">Room 00000</h1>
            <h2 id="progressLbl">Musique 01/20</h1>
        </div>
    
        <div id="mainMobile">
            <div id="timer">
                <div id="countdown">10</div>
            </div>
            <div style="width: 1px; height: 50px;"></div>
            <button id="buzBtn">Buzzer</button>
        </div>
    </div>
</body>

<script src="mobile.js"></script>