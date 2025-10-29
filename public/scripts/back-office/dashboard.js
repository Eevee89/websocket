$(document).ready(() => {
    $("#editVideoModal").modal("hide");

    updateItemLabels();
    computeAverageTime();

    if ($(".nav").css("display") === "none") {
        $(".dashboard").addClass("row justify-content-around align-items-end p-3").removeClass("tab-content");
        $(".dashboard-col").addClass("col-3").removeClass("tab-pane fade show active m-2");
    } else {
        $(".dashboard").addClass("tab-content").removeClass("row justify-content-around align-items-end p-3");
        $(".dashboard-col").addClass("tab-pane fade show active m-2").removeClass("col-3");
    }

    const list = $('.sortable-list');
    let draggingItem = null;

    list.on('dragstart', function (e) {
        draggingItem = $(e.target);
        draggingItem.addClass('dragging');
    });

    list.on('dragend', function (e) {
        $(e.target).removeClass('dragging');
        list.find('.sortable-item').removeClass('over');
        draggingItem = null;
        updateItemLabels();
    });

    list.on('dragover', function (e) {
        e.preventDefault();
        const draggingOverItem = getDragAfterElement(this, e.clientY);
        list.find('.sortable-item').removeClass('over');

        if (draggingOverItem) {
            $(draggingOverItem).addClass('over');
            draggingItem.insertBefore(draggingOverItem);
        } else {
            list.append($draggingItem);
        }
    });

    const reader = new FileReader();

    reader.onload = async function (event) {
        try {
            customInfos = JSON.parse(event.target.result);

            if (!validateYoutubeObject(customInfos)) {
                throw new Error("Objet invalide");
            }

            videosIds = Object.keys(customInfos);

            for (const video of videosIds) {
                if (!verifyInput(customInfos[video]["title"], "Title")) {
                    Swal.fire({
                        title: 'Titre invalide pour ' + video,
                        text: "Le titre personnalisé contient des caractères interdits : <>{}!?/\\\'\"$@",
                        timer: 3000,
                        color: "var(--dark)",
                        background: "repeating-linear-gradient(-45deg, var(--warning), var(--warning) 20px, var(--warning-shade) 20px, var(--warning-shade) 40px)"
                    });
                    continue;
                }
                if (!verifyInput(customInfos[video]["category"], "Category")) {
                    Swal.fire({
                        title: 'Categorie invalide pour ' + video,
                        text: "La catégorie contient des caractères interdits : <>{}!?/\\\'\"$@",
                        timer: 3000,
                        color: "var(--dark)",
                        background: "repeating-linear-gradient(-45deg, var(--warning), var(--warning) 20px, var(--warning-shade) 20px, var(--warning-shade) 40px)"
                    });
                    continue;
                }
                if (customInfos[video]["start"]) {
                    if (!verifyInput(customInfos[video]["start"], "StartTime")) {
                        Swal.fire({
                            title: 'Temps de début invalide pour ' + video,
                            text: "Le temps n'est pas un entier positif",
                            timer: 3000,
                            color: "var(--dark)",
                            background: "repeating-linear-gradient(-45deg, var(--warning), var(--warning) 20px, var(--warning-shade) 20px, var(--warning-shade) 40px)"
                        });
                        continue;
                    }
                }

                if ($.isEmptyObject($('[data-video="' + video + '"]')[0])) {
                    const title = await getVideoTitle(video);
                    if (!title) {
                        Swal.fire({
                            title: "Vidéo inaccessible",
                            text: "La vidéo " + video + " a été supprimée ou passée en privée.\n" +
                                "Elle ne peut donc plus être utilisée dans ce blind test",
                            confirmButtonText: "OK",
                            color: "var(--dark)",
                            customClass: {
                                confirmButton: "striped-danger-light"
                            },
                            background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
                        });
                        continue;
                    }

                    const item = generateVideoListItem(video,
                        customInfos[video]["title"],
                        customInfos[video]["category"],
                        customInfos[video]["points"] ? customInfos[video]["points"] : 1
                    );

                    const img = item.find(".video-thumbnail")[0];
                    if ($(".btn-hide").hasClass("fa-eye-slash")) {
                        $(img).attr("src", $(img).data("src"));
                    } else {
                        $(img).data("src", $(img).attr("src"));
                        $(img).attr("src", "/images/default.jpg");
                    }

                    $.ajax({
                        url: editVideoUrl,
                        type: "POST",
                        data: {
                            [video]: {
                                "video": video,
                                "title": customInfos[video]["title"],
                                "category": customInfos[video]["category"],
                                "points": customInfos[video]["points"] ? customInfos[video]["points"] : 1
                            }
                        }
                    })
                    .done(() => {
                        $("#videoList").append(item);
                    })
                    .fail((err) => {
                        console.log(err);
                    });

                    continue;
                }
                
                $.ajax({
                    url: editVideoUrl,
                    type: "POST",
                    data: {
                        [video]: {
                            "video": video,
                            "title": customInfos[video]["title"],
                            "category": customInfos[video]["category"],
                            "points": customInfos[video]["points"] ? customInfos[video]["points"] : 1
                        }
                    }
                })
                .done(() => {
                    $($('[data-video="' + video + '"]')[0])
                        .data("video", video)
                        .data("title", customInfos[video]["title"])
                        .data("category", customInfos[video]["category"]);
                    
                    if (customInfos[video]["points"]) {
                        $($('[data-video="' + video + '"]')[0]).data("points", customInfos[video]["points"]);
                    }
                })
                .fail((err) => {
                    console.log(err);
                });
            }

            updateItemLabels();
            computeAverageTime();
        } catch (error) {
            Swal.fire({
                title: 'Erreur',
                text: 'Erreur lors de la lecture du fichier.\n' + error,
                timer: 3000,
                color: "var(--dark)",
                background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
            });
        }
    };

    $(".btn-add").click((event) => {
        const parent = $($(event.target).parents()[3]);
        $("#modal-title").text("Ajout d'une vidéo");
        $("#thumbnail").attr("src", "/images/default.jpg");
        $("#url").val("").prop("disabled", false);
        $("#title").val("").prop("disabled", false);
        $("#category").val("").prop("disabled", false);
        $("#points").val(1).prop("disabled", false);
        $(".modal-header").addClass("striped-success").removeClass("striped-info").removeClass("striped-warning");
        $(".modal-body").addClass("striped-success-light").removeClass("striped-info-light").removeClass("striped-warning-light");
        $("#four").show();
        $("#submitBtn").text("Ajouter");
        $("#submitBtn").addClass("striped-success").removeClass("striped-info").removeClass("striped-warning");
        $("#editVideoModal").modal("show");
    });

    $("#url").blur(() => {
        const input = $("#url");
        const video = getYoutubeId(input.val());
        if (null === video) {
            input.val("");
            return;
        }

        $("#thumbnail").attr("src", `https://img.youtube.com/vi/${video}/mqdefault.jpg`);
    });

    $("#submitBtn").click(async () => {
        const video = getYoutubeId($("#url").val());
        if (null === video) {
            $("#editVideoModal").modal("hide");
            return;
        }

        if ($("#points").val() == "0") {
            return;
        }

        const title = await getVideoTitle(video);
        const titleInput = $("#title").val();

        if ($.isEmptyObject($('[data-video="' + video + '"]')[0])) {
            if (!title) {
                Swal.fire({
                    title: "Vidéo inaccessible",
                    text: "La vidéo " + video + " a été supprimée ou passée en privée.\n" +
                        "Elle ne peut donc plus être utilisée dans ce blind test",
                    confirmButtonText: "OK",
                    color: "var(--dark)",
                    customClass: {
                        confirmButton: "striped-danger-light"
                    },
                    background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
                });
                return;
            }

            const item = generateVideoListItem(
                video,
                titleInput ? titleInput : title,
                $("#category").val(),
                $("#points").val()
            );

            const img = item.find(".video-thumbnail")[0];
            if ($(".btn-hide").hasClass("fa-eye-slash")) {
                $(img).attr("src", $(img).data("src"));
            } else {
                $(img).data("src", $(img).attr("src"));
                $(img).attr("src", "/images/default.jpg");
            }

            $.ajax({
                url: editVideoUrl,
                type: "POST",
                data: {
                    [video]: {
                        "video": video,
                        "title": titleInput ? titleInput : title,
                        "category": $("#category").val(),
                        "points": $("#points").val()
                    }
                }
            })
            .done(() => {
                $("#videoList").append(item);

                updateItemLabels();
                computeAverageTime();

                $("#editVideoModal").modal("hide");
            })
            .fail((err) => {
                console.log(err);
            });

            return;
        }

        $.ajax({
            url: editVideoUrl,
            type: "POST",
            data: {
                [video]: {
                    "video": video,
                    "title": titleInput ? titleInput : title,
                    "category": $("#category").val(),
                    "points": $("#points").val()
                }
            }
        })
            .done(() => {
                $($('[data-video="' + video + '"]')[0])
                    .data("video", video)
                    .data("title", titleInput ? titleInput : title)
                    .data("category", $("#category").val())
                    .data("points", $("#points").val());
                
                $("#editVideoModal").modal("hide");
            })
            .fail((err) => {
                console.log(err);
            });
    });

    $(".btn-shuffle").click(() => {
        $("#videoList").randomize("", "div.list-group-item");

        updateItemLabels();
    });

    $(".btn-delete-all").click(() => {
        Swal.fire({
            title: "Attention",
            text: "Supprimer la liste de vidéo ?",
            showCancelButton: true,
            confirmButtonText: "OK",
            color: "var(--dark)",
            cancelButtonText: "Annuler",
            customClass: {
                confirmButton: "striped-warning-light",
                cancelButton: "striped-danger-light"
            },
            background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: delVideoUrl,
                    type: "POST",
                    data: {
                        "all": 1,
                        "videos": []
                    }
                })
                .done(() => {
                    $("#videoList").html("");
                    $("#nbTrack").html("<i class='fa fa-solid fa-music info mx-3'></i>0");
                    $("#maxScore").html("<i class='fa fa-solid fa-ranking-star info mx-3'></i>0 pts");
                    $("#avgTime").html("<i class='fa fa-solid fa-clock info mx-3'></i>0min");
                })
                .fail((err) => {
                    console.log(err);
                });
            }
        });
    });

    $(".btn-upload").click(() => {
        Swal.fire({
            title: "Que voulez-vous importer ?",
            text: "Importer un fichier ou une playlist Youtube",
            showCancelButton: true,
            color: "var(--dark)",
            confirmButtonText: "Playlist",
            cancelButtonText: "Fichier",
            customClass: {
                confirmButton: "striped-info-light",
                cancelButton: "striped-info-light"
            },
            background: "repeating-linear-gradient(-45deg, var(--info), var(--info) 20px, var(--info-shade) 20px, var(--info-shade) 40px)"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { value: url } = await Swal.fire({
                    input: "url",
                    inputLabel: "URL de la playlist",
                    color: "var(--dark)",
                    customClass: {
                        confirmButton: "striped-info-light",
                    },
                    background: "repeating-linear-gradient(-45deg, var(--info), var(--info) 20px, var(--info-shade) 20px, var(--info-shade) 40px)"
                });

                getAllPlaylistVideoUrls(url)
                    .then(async (urls) => {
                        for (const videoUrl of urls) {
                            const video = getYoutubeId(videoUrl);
                            if (null === video) {
                                continue;
                            }

                            const title = await getVideoTitle(video);
                            if (!title) {
                                Swal.fire({
                                    title: "Vidéo inaccessible",
                                    text: "La vidéo " + video + " a été supprimée ou passée en privée.\n" +
                                        "Elle ne peut donc plus être utilisée dans ce blind test",
                                    confirmButtonText: "OK",
                                    color: "var(--dark)",
                                    customClass: {
                                        confirmButton: "striped-danger-light"
                                    },
                                    background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
                                });
                                continue;
                            }

                            if ($.isEmptyObject($('[data-video="' + video + '"]')[0])) {
                                const item = generateVideoListItem(video, title, "", 1);

                                const img = item.find(".video-thumbnail")[0];
                                if ($(".btn-hide").hasClass("fa-eye-slash")) {
                                    $(img).attr("src", $(img).data("src"));
                                } else {
                                    $(img).data("src", $(img).attr("src"));
                                    $(img).attr("src", "/images/default.jpg");
                                }

                                $.ajax({
                                    url: editVideoUrl,
                                    type: "POST",
                                    data: {
                                        [video]: {
                                            "video": video,
                                            "title": title,
                                            "category": "",
                                            "points": 1
                                        }
                                    }
                                })
                                .done(() => {
                                    $("#videoList").append(item);
                                })
                                .fail((err) => {
                                    console.log(err);
                                });

                                continue;
                            }

                            $.ajax({
                                url: editVideoUrl,
                                type: "POST",
                                data: {
                                    [video]: {
                                        "video": video,
                                        "title": title,
                                        "category": "",
                                        "points": 1
                                    }
                                }
                            })
                            .done(() => {
                                $($('[data-video="' + video + '"]')[0])
                                    .data("video", video)
                                    .data("title", title)
                                    .data("category", "");
                            })
                            .fail((err) => {
                                console.log(err);
                            });

                            $($('[data-video="' + video + '"]')[0])
                                .data("video", video)
                                .data("title", await getVideoTitle(video))
                                .data("category", "");
                        }

                        updateItemLabels();
                        computeAverageTime();
                    })
                    .catch(error => {
                        console.error('Échec de la récupération des URLs:', error);
                    });
            } else {
                const { value: file } = await Swal.fire({
                    input: "file",
                    inputLabel: "Sélectionner votre fichier",
                    color: "var(--dark)",
                    inputAttributes: {
                        "accept": "application/json",
                    },
                    customClass: {
                        confirmButton: "striped-info-light",
                    },
                    background: "repeating-linear-gradient(-45deg, var(--info-light), var(--info-light) 20px, var(--info-light-shade) 20px, var(--info-light-shade) 40px)"
                });

                reader.readAsText(file);
            }
        });
    });

    $(".btn-download").click(() => {
        const datas = {};

        $('#videoList .list-group-item').each(function (index) {
            const item = $(this);
            datas[item.data("video")] = {
                "title": item.data("title"),
                "category": item.data("category"),
                "points": item.data("points")
            };
        });

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(datas)));
        element.setAttribute('download', "blindtest.json");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    });

    $(".btn-hide").click(() => {
        const sender = $(".btn-hide");
        const imgList = $("#videoList .list-group-item").find(".video-thumbnail");
        if (sender.hasClass("fa-eye")) {
            for (const img of imgList) {
                $(img).attr("src", $(img).data("src"));
            }
            sender.removeClass("fa-eye").addClass("fa-eye-slash");
        } else {
            for (const img of imgList) {
                $(img).data("src", $(img).attr("src"));
                $(img).attr("src", "/images/default.jpg");
            };
            sender.removeClass("fa-eye-slash").addClass("fa-eye");
        }
    });

    $('#points').on('input', function () {
        const value = Number($(this).val());
        const inputElement = this;

        if (value === 0) {
            inputElement.setCustomValidity("Le 0 n'est pas autorisé. Veuillez choisir un nombre non nul.");
        } else {
            inputElement.setCustomValidity("");
        }

        inputElement.reportValidity();
    });

    $(".btn-rem-guessing").click(() => {
        const time = Number($("#guessingTime").text());

        if (time === 5) {
            return;
        }

        $.ajax({
            url: editHideUrl,
            type: "POST",
            data: {
                "hideTime": time - 5
            }
        })
        .done(() => {
            $("#guessingTime").text(time - 5);

            if (time === 10) {
                $(".btn-rem-guessing").addClass("disabled");
            }
            computeAverageTime();
        })
        .fail((err) => {
            console.log(err);
        });
    });

    $(".btn-add-guessing").click(() => {
        const time = Number($("#guessingTime").text());

        $.ajax({
            url: editHideUrl,
            type: "POST",
            data: {
                "hideTime": time + 5
            }
        })
        .done(() => {
            $("#guessingTime").text(time + 5);

            if (time === 5) {
                $(".btn-rem-guessing").removeClass("disabled");
            }
            computeAverageTime();
        })
        .fail((err) => {
            console.log(err);
        });
    });

    $(".btn-rem-cooldown").click(() => {
        const time = Number($("#cooldownTime").text());

        if (time === 5) {
            return;
        }

        $("#cooldownTime").text(Math.max(time - 5, 5));

        if (time === 10) {
            $(".btn-rem-cooldown").addClass("disabled");
        }

        computeAverageTime();
    });

    $(".btn-add-cooldown").click(() => {
        const time = Number($("#cooldownTime").text());
        $("#cooldownTime").text(time + 5);

        if (time === 5) {
            $(".btn-rem-cooldown").removeClass("disabled");
        }

        computeAverageTime();
    });

    $(".btn-go").click(() => {
        const btn = $(".btn-go");
        if (btn.hasClass("disabled")) {
            return;
        }

        localStorage.setItem('userInteractedWithMedia', 'true');
        const redirectUrl = btn.data('redirect-url');
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    });
});

$(document).on("click", ".btn-info", ((event) => {
    const parent = $($(event.target).parents()[3]);
    $("#modal-title").text("Information sur la vidéo");
    $("#thumbnail").attr("src", `https://img.youtube.com/vi/${parent.data("video")}/mqdefault.jpg`);
    $("#url").val(`https://www.youtube.com/watch?v=${parent.data("video")}`).prop("disabled", true);
    $("#title").val(parent.data("title")).prop("disabled", true);
    $("#category").val(parent.data("category")).prop("disabled", true);
    $("#points").val(parent.data("points")).prop("disabled", true);
    $("#four").hide();
    $(".modal-header").addClass("striped-info").removeClass("striped-warning").removeClass("striped-success");
    $(".modal-body").addClass("striped-info-light").removeClass("striped-warning-light").removeClass("striped-success-light");
    $("#editVideoModal").modal("show");
}));

$(document).on("click", ".btn-edit", ((event) => {
    const parent = $($(event.target).parents()[3]);
    $("#modal-title").text("Modification de la vidéo");
    $("#thumbnail").attr("src", `https://img.youtube.com/vi/${parent.data("video")}/mqdefault.jpg`);
    $("#url").val(`https://www.youtube.com/watch?v=${parent.data("video")}`).prop("disabled", false);
    $("#title").val(parent.data("title")).prop("disabled", false);
    $("#category").val(parent.data("category")).prop("disabled", false);
    $("#points").val(parent.data("points")).prop("disabled", false);
    $(".modal-header").addClass("striped-warning").removeClass("striped-info").removeClass("striped-success");
    $(".modal-body").addClass("striped-warning-light").removeClass("striped-info-light").removeClass("striped-success-light");
    $("#four").show();
    $("#submitBtn").text("Modifier");
    $("#submitBtn").addClass("striped-warning").removeClass("striped-info").removeClass("striped-success");
    $("#editVideoModal").modal("show");
}));

$(document).on("click", ".btn-delete", ((event) => {
    const parent = $($(event.target).parents()[3]);
    Swal.fire({
        title: "Supprimer cette vidéo",
        text: "Supprimer '" + parent.data("title") + ' ?',
        imageUrl: `https://img.youtube.com/vi/${parent.data("video")}/mqdefault.jpg`,
        showCancelButton: true,
        color: "var(--dark)",
        confirmButtonText: "OK",
        cancelButtonText: "Annuler",
        customClass: {
            confirmButton: "striped-warning-light",
            cancelButton: "striped-danger-light"
        },
        background: "repeating-linear-gradient(-45deg, var(--danger), var(--danger) 20px, var(--danger-shade) 20px, var(--danger-shade) 40px)"
    }).then((result) => {
        if (result.isConfirmed) {
            const video = parent.data("video");

            $.ajax({
                url: delVideoUrl,
                type: "POST",
                data: {
                    "all": 0,
                    "videos": [video]
                }
            })
            .done(() => {
                $($('[data-video="' + video + '"]')[0]).remove();

                updateItemLabels();
                computeAverageTime();
            })
            .fail((err) => {
                console.log(err);
            });
        }
    });
}));

$(document).on('click', ".btn-kick-out", ((event) => {
    const parent = $($(event.target).parents()[3]);
    window.mySocket.send(JSON.stringify({
        "route": "room/kick-out",
        "datas": {
            "room": thisRoom,
            "player": $(parent).data("pseudo")
        }
    }));
}));

function generateVideoListItem(videoId, customTitle, category, points) {
    const url = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    return $(`
        <li class="list-group-item d-flex flex-column sortable-item"
            draggable="true" 
            data-video="${videoId}" 
            data-title="${customTitle}"
            data-category="${category}",
            data-points="${points}"
        >
            <div class="row">
                <div class="col-4 p-0 ps-1">
                    <img class="video-thumbnail" src="${url}" alt="Miniature YouTube" data-src="${url}"/>
                </div>
                <div class="col-8 d-flex flex-column justify-content-center">
                    <div class="row justify-content-end align-items-center pr-2">
                        <span class="badge bg-secondary item-number-label striped-info mr-2"></span>
                        <i class="fa fa-solid fa-circle-info info ms-2 mr-2 btn-info"></i>
                        <i class="fa fa-solid fa-pen warning ms-2 mr-2 btn-edit"></i>
                        <i class="fa fa-solid fa-trash danger ms-2 btn-delete"></i>
                    </div>
                </div>
            </div>
        </li>
    `);
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

(function ($) {
    $.fn.randomize = function (tree, childElem) {
        return this.each(function () {
            var $this = $(this);
            if (tree) $this = $(this).find(tree);
            var unsortedElems = $this.children(childElem);
            var elems = unsortedElems.clone();

            elems.sort(function () {
                return (Math.round(Math.random()) - 0.5);
            });

            for (var i = 0; i < elems.length; i++)
                unsortedElems.eq(i).replaceWith(elems[i]);
        });
    };
})(jQuery);

/**
 * Récupère toutes les URLs de vidéos d'une playlist YouTube.
 * Nécessite une clé API YouTube Data v3.
 * @param {string} playlistId L'ID de la playlist (ex: 'PL...').
 * @param {string} apiKey Votre clé API Google/YouTube.
 * @returns {Promise<string[]>} Un tableau contenant toutes les URLs de vidéos.
 */
async function getAllPlaylistVideoUrls(playlistUrl) {
    const BASE_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';
    let videoUrls = [];
    let nextPageToken = null;

    const playlistId = playlistUrl.substring(38);

    do {
        let url = `${BASE_URL}?part=snippet&maxResults=50&playlistId=${playlistId}&key=AIzaSyDWgvbXvCah8-fdnR7yMid0Uhjxj5t9KBA`;
        if (nextPageToken) {
            url += `&pageToken=${nextPageToken}`;
        }

        console.log(`Requête en cours... (Token: ${nextPageToken || 'Initial'})`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Erreur API: ${response.status} ${response.statusText}`);
            return [];
        }
        const data = await response.json();

        data.items.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            videoUrls.push(videoUrl);
        });

        nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return videoUrls;
}

function getDragAfterElement(container, y) {
    const draggableElements = $(container).find('.sortable-item:not(.dragging)');

    let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

    draggableElements.each(function () {
        const child = this;
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            closest = { offset: offset, element: child };
        }
    });
    return closest.element;
}

function validateYoutubeObject(obj) {
    for (const id in obj) {
        if (!isValidYoutubeId(id)) {
            return false;
        }
    }

    for (const id in obj) {
        const videoData = obj[id];
        if (
            typeof videoData !== 'object' ||
            videoData === null ||
            !videoData.hasOwnProperty('title') ||
            !videoData.hasOwnProperty('category') ||
            Object.keys(videoData).length > 3
        ) {
            return false;
        }
    }

    return true;
}

function verifyInput(input, from) {
    if (from == "Pseudo") {
        if (input.includes("<") || input.includes(">") || input.includes("!") || input.includes("?")
            || input.includes("/") || input.includes("\\") || input.includes("\"") || input.includes("\'")
            || input.includes("{") || input.includes("}") || input.includes("$") || input.includes("@")) {
            return false;
        }
        if (input.length > 15) {
            return false;
        }
        return true;
    }
    if (from == "Room") {
        const intInput = parseInt(input);
        if (isNaN(intInput) || input !== '' + intInput) {
            return false;
        }
        if (intInput > 99999 || intInput < 10000) {
            return false;
        }
        return true;
    }
    if (from == "StartTime") {
        const intInput = parseInt(input);
        if (isNaN(intInput) || input != '' + intInput) {
            return false;
        }
        if (intInput < 0) {
            return false;
        }
        return true;
    }
    if (from == "Category") {
        if (input.includes("<") || input.includes(">") || input.includes("!") || input.includes("?")
            || input.includes("/") || input.includes("\\") || input.includes("\"") || input.includes("\'")
            || input.includes("{") || input.includes("}") || input.includes("$") || input.includes("@")) {
            return false;
        }
        return true;
    }
    if (from == "Title" || from == "Answer") {
        if (input.includes("<") || input.includes(">") || input.includes("?") || input.includes("/")
            || input.includes("\\") || input.includes("\"") || input.includes("{") || input.includes("}")
            || input.includes("$") || input.includes("@")) {
            return false;
        }
        return true;
    }
    return false;
}

function updateItemLabels() {
    let maxScore = 0;
    const items = $('#videoList .list-group-item');

    items.each(function (index) {
        const itemNumber = index + 1;
        const labelText = `N° ${itemNumber}`;
        $(this).find('.item-number-label').text(labelText);
        maxScore += $(items[index]).data("points");
    });

    $("#nbTrack").html("<i class='fa fa-solid fa-music info mx-3'></i>" + items.length);
    $("#maxScore").html("<i class='fa fa-solid fa-ranking-star info mx-3'></i>" + maxScore);
}

function computeAverageTime() {
    const items = $('#videoList .list-group-item');

    if (items.length === 0) {
        $("#avgTime").html("<i class='fa fa-solid fa-clock info mx-3'></i>0min");

        return;
    }

    const guessing = Number($("#guessingTime").text());
    const cooldown = Number($("#cooldownTime").text());
    const quarters = Math.ceil((items.length * (guessing + cooldown) + 600) / 900);
    const rest = quarters % 4;
    const hours = (quarters - rest) / 4;

    $("#avgTime").html("<i class='fa fa-solid fa-clock info mx-3'></i>" + (hours ? hours + "h" : "") + rest * 15 + "min");
}