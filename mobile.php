<body>
    <div id="connBody" class="fakeBody">
        <div id="connBox" class="box">
            <input type="text" id="pseudoInput" name="pseudo" placeholder="Entrez votre pseudo"/>
            <input type="number" id="roomInput" name="room" placeholder="ID de la partie" min="10000" max="99999"/>
            <button id="pseudoSubmit">Rejoindre</button>
        </div>
        <div id="sepconn" style="width: 1px; height: 20px;"></div>
        <p id="notroom" style="color: red;"> La partie n'existe pas </p>
    </div>

    <div id="waitBody" class="fakeBody">
        <p> La partie va bientôt commencer... </p>
        <div style="width: 1px; height: 20px;"></div>
        <div id="colorBox" class="box">
            <p> Choisissez votre couleur </p>
            <div id="colorList">

            </div>
        </div>
    </div>
</body>

<script src="mobile.js"></script>