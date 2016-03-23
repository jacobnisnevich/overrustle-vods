$(document).ready(function() {
    var id = getUrlParameter("id");

    if (id) {
        loadPlayer(id);
    } else {
        loadBrowser();
    }

    $("#header-title").click(function() {
        window.location = "index.html";
    });

    $("body").on("click", ".vod-entry", function() {
        window.location.href += "?id=" + $(this).attr("id"); 
    });
});

var loadBrowser = function() {
    var destinyVodsUrl = "https://api.twitch.tv/kraken/channels/destiny/videos?limit=9&broadcasts=true";

    $.get(destinyVodsUrl, function(data) {
        createVodEntries(data);
    });
}

var loadPlayer = function(id) {
    $("#player").show();

    var options = {
    //    width: $("body").width() - 390,
    //    height: $("body").height() - 64,
        channel: "destiny", 
        video: id
    };
    var player = new Twitch.Player("video-player", options);

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

