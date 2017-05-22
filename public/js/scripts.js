$(document).ready(function() {
    var id = getUrlParameter("id");

    if (id) {
        loadPlayer(id);
    } else {
        loadBrowser();
    }

    $(".tooltip").tooltipster();

    $("#header-title").click(function() {
        window.location = "/";
    });

    $("body").on("click", ".vod-entry", function() {
        window.location.href += "?id=" + $(this).attr("id"); 
    });
});

var loadBrowser = function() {
    var destinyVodsUrl = "https://api.twitch.tv/kraken/channels/destiny/videos?limit=9&broadcasts=true&client_id=88bxd2ntyahw9s8ponrq2nwluxx17q";

    $.get(destinyVodsUrl, function(data) {
        createVodEntries(data);
    });
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

