$(document).ready(function() {
    var id = getUrlParameter("id");
    var page = 1;

    if (id) {
        loadPlayer(id);
    } else {
        loadVODs(page);
    }

    $("#next-page-button").click(function() {
        page += 1;
        $("#page-number").text(page);
        loadVODs(page);

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
            loadVODs(page);
        }

        if (page === 1) {
            $("#previous-page-button").addClass("disabled");
        } else {
            $("#previous-page-button").removeClass("disabled");
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

var loadVODs = function(page) {
    var destinyVodsUrl = "https://api.twitch.tv/kraken/channels/destiny/videos?limit=9&offset=" + (page - 1) * 9 + 
                         "&broadcasts=true&client_id=88bxd2ntyahw9s8ponrq2nwluxx17q";

    $.get(destinyVodsUrl, function(data) {
        $("#vod-list").empty();
        createVodEntries(data);
    });
}

var loadDestinyStatus = function() {
    var destinyStatusUrl = "https://api.twitch.tv/kraken/streams/destiny?client_id=88bxd2ntyahw9s8ponrq2nwluxx17q";

    $.get(destinyStatusUrl, function(data) {
        if (data.stream === null) {
            $("#destiny-status").text("Destiny is offline.");
            $("#destiny-status").css("color", "#a70000");
        } else {
            $("#destiny-status").text("Destiny is LIVE!");
            $("#destiny-status").css("color", "#01f335");            
        }
    })
}

var loadPlayer = function(id) {
    $("#player").css("display", "flex");

    var player = new Twitch.Player("video-player", { video: id });
    var chat = new Chat(id);

    player.addEventListener("play", function() {
        chat.startChatStream();
    });

    player.addEventListener("pause", function() {
        chat.pauseChatStream();
    });

    $("body").css("overflow", "hidden");
}

var createVodEntries = function(vodData) {
    vodData.videos.forEach(function(vod) {
        createVodEntry({
            id: vod._id, 
            title: vod.title, 
            image: vod.preview, 
            views: vod.views, 
            date: formatDate(vod.recorded_at), 
            length: formatLength(vod.length),
            game: vod.game
        });
    })
};

var createVodEntry = function(vod) {
    $("#vod-tmpl").tmpl(vod).appendTo("#vod-list");
}

