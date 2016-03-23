var Chat = function(id) {
	this.videoId = id;
	this.status = "loading";

	self = this;
	$.get("https://api.twitch.tv/kraken/videos/" + id, function(vodData) {
		self.recordedTime = moment(vodData.recorded_at).utc();
		self.currentTime = self.recordedTime;

		// http://dgg.overrustlelogs.net/Destinygg chatlog/March 2016/2016-03-23
		var overrustleLogsUrl = "http://dgg.overrustlelogs.net/Destinygg%20chatlog/" + 
			self.recordedTime.format("MMMM") + "%20" + 
			self.recordedTime.format("YYYY") + "/" + 
			self.recordedTime.format("YYYY") + "-" +
			self.recordedTime.format("MM") + "-" +
			self.recordedTime.format("DD");

		$.get("/chat", {
			url: overrustleLogsUrl
		}, function(data) {
			self.chat = JSON.parse(data);
			self.startChatStream();
		});
	});


	this.startChatStream = function() {
		this.status = "running";
	};

	this.pauseChatStream = function() {
		this.status = "paused";
	};

	window.setInterval(function() {
		if (self.status == "running" && self.chat) {
			var utcFormat = self.currentTime.format().replace("+00:00", "Z");
			if (self.chat[utcFormat]) {
				self.chat[utcFormat].forEach(function(chatLine) {
					$("#chat-stream").append("<div class='chat-line'>" + 
						"<span class='username'>" + 
						chatLine.username + "</span>: " + 
						"<span class='message'>" + 
						chatLine.message + "</span></div>");
				});

				$("#chat-stream").animate({ 
					scrollTop: $("#chat-stream").prop("scrollHeight")
				}, 1000);
			}

			self.currentTime.add(1, 's');
		}
	}, 1000);
};
