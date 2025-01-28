<body>
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
                        <h2>Temps pour deviner (sec.)</h2>
                        <div class="sep"></div>
                        <div class="buttons">
                            <button id="btcm5"><strong><h1>-</h1></strong></button>
                            <h2 id="btcvalue">15</h2>
                            <button id="btcp5"><strong><h1>+</h1></strong></button>
                        </div>
                    </div>
    
                    <div id="showTimeControl" class="box">
                        <h2>Temps entre chaque (sec.)</h2>
                        <div class="sep"></div>
                        <div class="buttons">
                            <button id="rtcm5"><strong><h1>-</h1></strong></button>
                            <h2 id="rtcvalue">10</h2>
                            <button id="rtcp5"><strong><h1>+</h1></strong></button>
                        </div>
                    </div>
    
                    <div id="infos">
                        <h2 id="ttlmlabel">Nombre de musiques :</h2>
                        <h2 id="ttltlabel">Temps total :</h2>
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
                            <img id="toggleBtn" class="svg" src="shown.png" srcset="shown.svg"/>
    
                            <img id="firstBtn" class="svg" src="first.png" srcset="first.svg"/>
                            <img id="prevBtn" class="svg" src="up.png" srcset="up.svg"/>
                            <img id="nextBtn" class="svg" src="down.png" srcset="down.svg"/>
                            <img id="lastBtn" class="svg" src="last.png" srcset="last.svg"/>
    
                            <img id="deleteBtn" class="svg" src="delete.png" srcset="delete.svg" title="Supprimer tout"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="gameBody" class="fakeBody">
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
                  <div id="customVideoTitle"><h3 id="customVideoTitleInnerText">TEST</h3></div>
                  <div id="catInfo"><h3 id="catInfoInnerText">TEST</h3></div>
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

<script src="desktop.js"></script>