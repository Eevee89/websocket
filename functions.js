let videosIds = []; // 'srhni4w2TbI', 'i8wghCdMncU'
let rejectedIds = [];
let selectedItem = null;
let hideTime = 0;
let showTime = 0;
let players = [];
let readies = 0;
let myPseudo = "";

let connId = 0;
let room = 0;
let nbVids = 0;
let timerPaused = false;

let customInfos = { };

const delay = ms => new Promise(res => setTimeout(res, ms));

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

function getYoutubeId(url) {
    if (url.includes("https://www.youtube.com/watch?v=")) {
        const tail = url.substring(32);
        return tail.split("&")[0];
    }
    else if (url.includes("https://youtu.be/")) {
        const tail = url.substring(17);
        return tail.split("?")[0];
    }
    return null;
}

function getVideoTitle(id) {
    const apiKey = 'AIzaSyDWgvbXvCah8-fdnR7yMid0Uhjxj5t9KBA';
  
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${apiKey}&part=snippet`;
  
    return fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.items && data.items[0].snippet) {
            return data.items[0].snippet.title;
        } else {
            return "No video title found";
        }
    })
    .catch(error => {
        console.error(error);
        return "Error fetching video title"; 
    });
}

async function createVideoItem(item, index) {
    let videoTitle = await getVideoTitle(item);

    if (!customInfos[item]) {
        customInfos[item] = {
            "title": "Nouveau titre " + index,
            "category": "Not specified"
        }
    }

    const videoListItem = $('<li>').attr({id: item});
    const videoTitleElement = $('<input>')
    .attr({
        id: item,
        type: "text",
        placeholder: "Titre personnalisé",
        value: customInfos[item]["title"]
    });
    const videoInfo = $('<div>').addClass('videoInfo');
    const imageContainer = $('<div>').addClass('imgCont');
    const image = $('<img>').attr({ id: item, src: "https://img.youtube.com/vi/"+item+"/default.jpg", alt: 'Not implemented' });
    const titleElement = $('<h3>').text(videoTitle);

    imageContainer.append(image);
    videoInfo.append(imageContainer, titleElement);
    videoListItem.append(videoTitleElement, videoInfo);

    $('#videoList').append(videoListItem);
}

function getTotalTime() {
    let nbVideos = videosIds.length;
    let blindtime = parseInt($("#btcvalue").text());
    let revealtime = parseInt($("#rtcvalue").text());

    return (blindtime+revealtime)*nbVideos;
}

function formatTime() {
    let time = getTotalTime();
    if (time < 60) {
        return time+"s";
    } 
    else if (time < 3600) {
        let m = time/60 >> 0;
        let s = time - 60*m;
        return m+"m"+s+"s";
    }
    else {
        let h = time/3600 >> 0;
        time -= 3600*h;
        let m = time/60 >> 0;
        let s = time - 60*m;
        return h+"h"+m+"m"+s+"s";
    }
}


function countdown(seconds) {
    let intervalId = setInterval(() => {
        $("#countdown").text(seconds--);
  
        if (seconds === 0) {
            clearInterval(intervalId);
        }
    }, 1000);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
 }

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function gradientColorsCompute(n) {
    let color1 = "#00FF00";
    let color2 = "#FF0000";

    if (n === 2) {
        return [color1, color2];
    }
    
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    // Calculate color differences
    const deltaR = rgb2.r - rgb1.r;
    const deltaG = rgb2.g - rgb1.g;
    const deltaB = rgb2.b - rgb1.b;

    // Calculate step size
    const stepR = deltaR / (n - 1);
    const stepG = deltaG / (n - 1);
    const stepB = deltaB / (n - 1);

    // Generate gradient colors
    const gradientColors = [];
    for (let i = 0; i < n; i++) {
        const r = Math.round(rgb1.r + i * stepR);
        const g = Math.round(rgb1.g + i * stepG);
        const b = Math.round(rgb1.b + i * stepB);
        gradientColors.push(rgbToHex(r, g, b));
    }

    return gradientColors;
}

function addPlayer(item) {
    const playerTile = $('<div>').addClass('playerTile');
    const playerPseudo = $('<h3>').text(item["pseudo"]);
    $(playerPseudo).css("color", item["color"]);

    playerTile.append(playerPseudo);
    $(playerTile).attr({id: item["pseudo"]});

    $('#playerTiles').append(playerTile);
}

function removePlayer(pseudo) {
    $('#'+pseudo).remove();
}

function createPlayerItem(item, index) {
    const playerListItem = $('<li>').attr({id: index});
    const playerInfo = $('<div>').addClass('playerInfo');
    const playerPseudo = $('<h3>').text(item["pseudo"]);
    const playerScore = $('<h3>').text(0);

    playerInfo.append(playerPseudo, playerScore);
    playerListItem.append(playerInfo);

    $(playerListItem).css("background-color", item["color"]);

    $('#playerList').append(playerListItem);
}

function createColorItem(name, hex) {
    const color = $('<div>').attr({id: name});
    $(color).addClass("colorTile");
    $(color).css("background-color", hex);

    $('#colorList').append(color);
}