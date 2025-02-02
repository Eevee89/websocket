<body>
    <div id="connBody" class="fakeBody">
        <div id="connBox" class="box">
            <p id="notconnected" style="color: red;"> Erreur de connexion au serveur </p>
            <input type="text" id="pseudoInput" name="name" placeholder="Entrez votre pseudo"/>
            <button id="pseudoSubmit">Créer</button>
        </div>
        <div id="sepconn" style="width: 1px; height: 20px;"></div>
        <button id="rules">Règles</button>
    </div>

    <div id="mainBody" class="fakeBody">
        <div id="header">
            <h1 id="roomId">Room 00000</h1>
            <h1 id="beginBtn">Commencer</h1>
        </div>
    
        <div id="testplayer" hidden></div>
    
        <div id="main">
            <div id="leftPanel">
                <div id="timeControlPanel">
                    <div id="hideTimeControl" class="box">
                        <h2 id="hideTimeControlLabel">Temps pour deviner (sec.)</h2>
                        <div class="sep"></div>
                        <div class="buttons">
                            <button id="btcm5"><strong><h1>-</h1></strong></button>
                            <h2 id="btcvalue">15</h2>
                            <button id="btcp5"><strong><h1>+</h1></strong></button>
                        </div>
                    </div>
    
                    <div id="showTimeControl" class="box">
                        <h2 id="showTimeControlLabel">Nombre d'essais/musique</h2>
                        <div class="sep"></div>
                        <div class="buttons">
                            <button id="rtcm5"><strong><h1>-</h1></strong></button>
                            <h2 id="rtcvalue">3</h2>
                            <button id="rtcp5"><strong><h1>+</h1></strong></button>
                        </div>
                    </div>
    
                    <div id="infos">
                        <h2 id="ttlmlabel">Nombre de musiques :</h2>
                        <h2 id="ttltlabel">Temps total :</h2>
                        <h2 id="attemptlabel">Nombre d'essais : 3</h2>
                    </div>
                </div>
                <div id="playerControlPanel">
                    <div id="pcph">
                        <h2>Liste des joueurs</h2>
                    </div>
                    <div id="playerTiles">
                        
                    </div>
                </div>
            </div>
        
            <div id="rightPanel">
                <div id="subRightPanel" class="box">
                    <div id="videoListCont">
                        <ul id="videoList">
                        </ul>
                    </div>
                    <div id="listControlPanel">
                        <div id="urlForm">
                            <input id="urlInput" type="text" placeholder="Entrez une url Youtube"/>
                            <button id="addBtn"><strong><h1>+</h1></strong></button>
                        </div>
    
                        <div id="catForm">
                            <input id="catInput" type="text" placeholder="Entrez la categorie"/>
                            <button id="catBtn"><strong><h1>&#x2714;</h1></strong></button>
                        </div>
    
                        <div id="otherOpt">
                            <img id="toggleBtn" class="svg" src="images/shown.png" srcset="images/shown.svg"/>
    
                            <img id="firstBtn" class="svg" src="images/first.png" srcset="images/first.svg"/>
                            <img id="prevBtn" class="svg" src="images/up.png" srcset="images/up.svg"/>
                            <img id="nextBtn" class="svg" src="images/down.png" srcset="images/down.svg"/>
                            <img id="lastBtn" class="svg" src="images/last.png" srcset="images/last.svg"/>

                            <img id="shuffleBtn" class="svg" src="images/shuffle.png" srcset="images/shuffle.svg"/>
                            <img id="dwnldBtn" class="svg" src="images/download.png" srcset="images/download.svg"/>
                            <img id="uploadBtn" class="svg" src="images/upload.png" srcset="images/upload.svg"/>
                            <input type="file" id="fileInput" accept=".json" style="display: none;">
                            <img id="deleteBtn" class="svg" src="images/delete.png" srcset="images/delete.svg" title="Supprimer tout"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="gameBody" class="fakeBody">
        <div id="header">
            <h1 id="roomId2">Room 00000</h1>
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
                    <div id="customVideoTitle"><h3 id="customVideoTitleInnerText">TEST</h3></div>
                    <div id="catInfo"><h3 id="catInfoInnerText">TEST</h3></div>
                    <div id="nextVidCont"><button id="nextVidBtn"><img id="nextVidBtnImg" src="images/next.png" srcset="images/next.svg"></button></div>
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
    </div>
</body>

<script src="js/desktop.js"></script>