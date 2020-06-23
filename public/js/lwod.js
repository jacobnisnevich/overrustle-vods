var LWOD = function(id, player) {
	this.player = player;

	var self = this;

	$.get(lwodUrl, {
		id: id
	}, function (data) {
		if (data != "") {
			console.log("passed")
			$("#lwod-button").show();
			createLWODTimestamps(data);
		}
	});

	$("body").on("click", ".timestamp-entry", function() {
		timestamp = moment.duration($(this).attr("starttime")).asSeconds();
		player.seek(timestamp);
		$("#lwod").hide();
		$("#player").show();
    });
}