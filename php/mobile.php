<body>
    <div id="connBody" class="fakeBody">
        <p id="notconnected" style="color: red;"> Erreur de connexion au serveur </p>
        <div id="connBox" class="box">
            <input type="text" id="pseudoInput" name="pseudo" placeholder="Entrez votre pseudo"/>
            <input type="number" id="roomInput" name="room" placeholder="ID de la partie" min="10000" max="99999"/>
            <button id="pseudoSubmit">Rejoindre</button>
        </div>
        <div id="sepconn" style="width: 1px; height: 20px;"></div>
        <button id="rules">Comment jouer ?</button>
    </div>

    <div id="waitBody" class="fakeBody">
        <div id="headerMobile">
            <h2 id="roomId">Room 00000</h1>
        </div>

        <div id="waitMain">
            <p id="gametobegin"> La partie va bientôt commencer... </p>
            <div style="width: 1px; height: 20px;"></div>
            <div id="colorBox" class="box">
                <div id="tabs">
                    <div id="tab1" class="waitmenuselected">
                        <h3 id="colorchoice"> Couleurs </h3>
                    </div>
                    <div style="width: 2px; height: 90%; background-color: #AAA"></div>
                    <div id="tab2">
                        <h3 id="buzzerchoice"> Sons de buzz </h3>
                    </div>
                </div>
                <div style="width: 90%; height: 2px; background-color: #AAA; margin-left: 1px; margin-right: 1px;"></div>
                <div id="colorList">

                </div>
                <div id="soundList" style="display: none;">

                </div>
            </div>
            <div style="width: 1px; height: 20px;"></div>
            <button id="readyBtn">Prêt ?</button>
            <div style="width: 1px; height: 20px;"></div>
            <p id="readyinfo"> Note: Se mettre 'prêt' est définitif </p>
            <div style="width: 1px; height: 20px;"></div>
            <button id="quitBtn">Quitter</button>
        </div>
    </div>

    <div id="gameBody" class="fakeBody">
        <div id="headerMobile">
            <h2 id="roomId2">Room 00000</h1>
            <h2 id="progressLbl">Musique 01/20</h1>
        </div>
    
        <div id="mainMobile">
            <div style="width: 1px; height: 10px;"></div>
            <div id="timer">
                <div id="countdown">10</div>
            </div>
            <div style="width: 1px; height: 20px;"></div>
            <div id="buzCont" class="box">
                <input type="text" id="answerInput" name="answer" placeholder="Entrez votre réponse"/>
                <button id="buzBtn"><strong>Buzzer</strong></button>
            </div>
        </div>

        <div id="ansCont">
            <div id="thumbCont"><img id="thumb"/></div>
            <div style="width: 1px; height: 50px;"></div>
            <h3 id="ansTitle" style="text-align: center;"></h3>
        </div>
    </div>

    <div style="display: none;">
        <audio id="amongusAudio">
            <source src="../sounds/amongus.mp3" type="audio/mpeg"/>
        </audio>
    </div>
</body>

<script src="js/mobile.js"></script>