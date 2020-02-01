$(document).ready(function() {
    var id = getUrlParameter("id");
    var page = 1;
    //nextPage === 0 when you go to the next page, === 1 when you go back a page, === 2 when you load the first page
    var nextPage = 2;

    if (id) {
        loadPlayer(id);
        $("#browse").hide();
        $("#player").show();
    } else {
        loadVODs(nextPage);
        $("#player").hide();
        $("#browse").show();
    }

    $("#player").split({
        orientation: 'vertical',
        limit: 10,
        position: '80%'
    });

    $("#next-page-button").click(function() {
        page += 1;
        nextPage = 0;

        $("#page-number").text(page);
        loadVODs(nextPage);

        if (page === 1) {
            $("#previous-page-button").addClass("disabled");
        } else {
            $("#previous-page-button").removeClass("disabled");
        }
    });

    $("#previous-page-button").click(function() {
        nextPage = 1;
        if (page > 1) { 
            page -= 1;
            $("#page-number").text(page);
            loadVODs(nextPage);
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

var destinyUserID = 18074328;

var pageCursor = 0;

$.ajaxSetup({headers: {"Client-ID" : "88bxd2ntyahw9s8ponrq2nwluxx17q"}})

var loadVODs = function(nextPage) {
    if (nextPage === 2) {
        var destinyVodsUrl = "https://api.twitch.tv/helix/videos/?user_id=" + destinyUserID + "&first=9&type=archive";

        $.get(destinyVodsUrl, function(data) {
            $("#vod-list").empty();
            createVodEntries(data);
            pageCursor = data.pagination.cursor;
        });
    } else if (nextPage === 0) {
        var destinyVodsUrl = "https://api.twitch.tv/helix/videos/?user_id=" + destinyUserID + "&first=9&type=archive&after=" + pageCursor;

        $.get(destinyVodsUrl, function(data) {
            $("#vod-list").empty();
            createVodEntries(data);
            pageCursor = data.pagination.cursor;
        });
    } else {
        var destinyVodsUrl = "https://api.twitch.tv/helix/videos/?user_id=" + destinyUserID + "&first=9&type=archive&before=" + pageCursor;

        $.get(destinyVodsUrl, function(data) {
            $("#vod-list").empty();
            createVodEntries(data);
            pageCursor = data.pagination.cursor;
        });
    }
    
}

var loadDestinyStatus = function() {
    var destinyStatusUrl = "https://api.twitch.tv/helix/streams?user_login=destiny";

    $.get(destinyStatusUrl, function(data) {
        if (data.data === null || data.data.length === 0) {
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
    vodData.data.forEach(function(vod) {
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

