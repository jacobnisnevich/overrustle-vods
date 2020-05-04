var globals = {};

$(document).ready(function() {
    var id = getUrlParameter("id");
    var time = getUrlParameter("t");
    var page = 1;
    globals.sizes = localStorage.getItem('split-sizes');

    if (globals.sizes) {
        globals.sizes = JSON.parse(globals.sizes);
    } else {
        globals.sizes = [80, 20];
    }

    if (id && time) {
        loadPlayer(id, time);
        $("#browse").hide();
        $("#player").show();
    } else if (id && !time) {
        loadPlayer(id);
        $("#browse").hide();
        $("#player").show();
    } else {
        // preloading all vods since twitch api pagination is inconsistent and bad >:(
        loadVODs().then(result => {
            allVODs = result;
            return result.slice(0, 9);
        }).then(nineEntries => {
            createVodEntries(nineEntries);
        });
        $("#player").hide();
        $("#browse").show();
    }

    globals.splitInstance = Split(['#video-player', '#chat-container'], {
        sizes: globals.sizes,
        gutterSize: 8,
        minSize: 200,
        cursor: 'col-resize',
        onDragEnd: function(sizes) {
            localStorage.setItem('split-sizes', JSON.stringify(sizes));
        }
    });

    $("#next-page-button").click(function() {
        if (page != Math.ceil(allVODs.length/9)) {
            page += 1;
            $("#page-number").text(page);
            $("#vod-list").empty();
            nineEntries = allVODs.slice((page-1)*9,page*9);
            createVodEntries(nineEntries);
        }

        if (page === Math.ceil(allVODs.length/9)) {
            $("#next-page-button").addClass("disabled");
        } else {
            $("#next-page-button").removeClass("disabled");
        }
        
        if (page === 1) {
            $("#previous-page-button").addClass("disabled");
        } else {
            $("#previous-page-button").removeClass("disabled");
        }
    });

    $("#previous-page-button").click(function() {
        if (page > 1) { 
            page -= 1;
            $("#page-number").text(page);
            $("#vod-list").empty();
            nineEntries = allVODs.slice((page-1)*9,page*9);
            createVodEntries(nineEntries);
        }

        if (page === Math.ceil(allVODs.length/9)) {
            $("#next-page-button").addClass("disabled");
        } else {
            $("#next-page-button").removeClass("disabled");
        }

        if (page === 1) {
            $("#previous-page-button").addClass("disabled");
        } else {
            $("#previous-page-button").removeClass("disabled");
        }
    });

    $("#dec-delay-button").click(function() {
        delay = Number($("#delay").text());
        if (delay >= 1) {
            delay -= 1;
            $("#delay").text(delay);
        }
    });

    $("#inc-delay-button").click(function() {
        delay = Number($("#delay").text()) + 1;
        $("#delay").text(delay);
    });

    $("#switch-sides-button").click(function() {
        if (document.getElementById("player").style["flex-direction"] === "row") {
            document.getElementById("player").style["flex-direction"] = "row-reverse";
            globals.splitInstance.destroy();
            globals.splitInstance = Split(['#video-player', '#chat-container'], {
                sizes: globals.sizes,
                gutterSize: 8,
                minSize: 200,
                cursor: 'col-resize',
                onDragEnd: function(sizes) {
                    globals.sizes = sizes;
                    localStorage.setItem('split-sizes', JSON.stringify(sizes));
                }
            });
            return true;
        }
        if (document.getElementById("player").style["flex-direction"] === "row-reverse") {
            document.getElementById("player").style["flex-direction"] = "row";
            globals.splitInstance.destroy();
            globals.splitInstance = Split(['#video-player', '#chat-container'], {
                sizes: globals.sizes,
                gutterSize: 8,
                minSize: 200,
                cursor: 'col-resize',
                onDragEnd: function(sizes) {
                    globals.sizes = sizes;
                    localStorage.setItem('split-sizes', JSON.stringify(sizes));
                }
            });
            return true;
        }
    });

    // Check if Destiny is online every 5 minutes
    setInterval(loadDestinyStatus(), 300000);

    $(".tooltip").tooltipster();

    $("#header-title").click(function() {
        window.location = "/";
    });

    $("body").on("click", ".vod-entry", function() {
        window.location.href += "?id=" + $(this).attr("id"); 
    });
});

var allVODs = [];

async function loadVODs() {
    vodArray = [];
    var destinyVODsURL = "/vodinfo?user_id=" + destinyUserID + "&first=100&type=archive";
    let response = await fetch(destinyVODsURL);
    let data = await response.json();
    pageCursor = data.pagination.cursor;
    vodArray.push(...data.data);
    // if there are more than 100 vods, check next page and add everything there to the array; repeat until done
    while (data.data.length === 100 && pageCursor != ("" || null)) {
        destinyVODsURL = "/vodinfo?user_id=" + destinyUserID + "&first=100&type=archive&after=" + pageCursor;
        response = await fetch(destinyVODsURL);
        data = await response.json();
        pageCursor = data.pagination.cursor;
        vodArray.push(...data.data);
    };
    return vodArray;
};

var destinyUserID = 18074328;

var pageCursor = 0;

var loadDestinyStatus = function() {
    var destinyStatusUrl = "/userinfo?user_login=destiny";

    $.get(destinyStatusUrl, function(userdata) {
        data = JSON.parse(userdata)
        if (data.data === null || data.data.length === 0) {
            $("#destiny-status").text("Destiny is offline.");
            $("#destiny-status").css("color", "#a70000");
        } else {
            $("#destiny-status").text("Destiny is LIVE!");
            $("#destiny-status").css("color", "#01f335");            
        }
    })
}

var loadPlayer = function(id, time) {
    $("#player").css("display", "flex");

    var player = new Twitch.Player("video-player", { video: id , time: time });
    var chat = new Chat(id, player);

    player.addEventListener("play", function() {
        chat.startChatStream();
    });

    player.addEventListener("pause", function() {
        chat.pauseChatStream();
    });

    $("body").css("overflow", "hidden");
}

var createVodEntries = function(vodData) {
    vodData.forEach(function(vod) {
        createVodEntry({
            id: vod.id, 
            title: vod.title, 
            image: vod.thumbnail_url.replace(/%([\s\S]*)(?=\.)/, "320x180"), 
            views: vod.view_count, 
            date: formatDate(vod.created_at), 
            length: vod.duration,
            game: vod.game
        });
    })
};

var createVodEntry = function(vod) {
    $("#vod-tmpl").tmpl(vod).appendTo("#vod-list");
}

