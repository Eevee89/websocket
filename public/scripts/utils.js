function generatePlayerListItem(pseudo, team, color, dashboard = true) {
    const thirdColumn = dashboard
        ? '<i class="fa fa-solid fa-trash danger ms-2 btn-kick-out"></i>'
        : '<span id="score" class="info-span">000</span>'
        ;
    
    if (!team) {
        team = '';
    }

    const item = $(`
        <li class="list-group-item d-flex flex-column sortable-item not-ready" draggable="true" data-color="${color}" data-pseudo="${pseudo}">
            <div class="row">
                <div class="col-1 d-flex flex-column justify-content-center align-items-center">
                    <div class="round"></div>
                </div>
                <div class="col-9 d-flex flex-column justify-content-center">
                    <span class="info-span">[${team}] ${pseudo}</span>
                </div>
                <div class="col-2 d-flex flex-column justify-content-center">
                    <div class="row justify-content-end align-items-center pr-2">
                        ${thirdColumn}
                    </div>
                </div>
            </div>
        </li>
    `);

    item.find(".round").css("background-color", color);
    return item;
}

async function getVideoTitle(id) {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=AIzaSyDWgvbXvCah8-fdnR7yMid0Uhjxj5t9KBA&part=snippet`;

    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Erreur API: ${response.status} ${response.statusText}`);
        return "";
    }

    try {
        const data = await response.json();
        if (data.items && data.items[0].snippet) {
            return data.items[0].snippet.title;
        }

        return "";
    } catch (e) {
        console.error(e);
        return "";
    }
}

function isValidYoutubeId(str) {
    const regExp = /^[a-zA-Z0-9_-]{11}$/;
    return regExp.test(str);
}

function showErrorSwal(title, message) {
    Swal.fire({
        title: title ? title : '',
        text: message ? message : '',
        color: "var(--dark)",
        confirmButtonText: "OK",
        customClass: {
            confirmButton: "striped-warning-light",
        },
        background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
    });
}

function everyoneReady() {
    return $(".list-group-item.not-ready").length === 0 && $(".list-group-item.ready").length > 0;
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
    let color1 = "#55FF55";
    let color2 = "#FF5555";

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