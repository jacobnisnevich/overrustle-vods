var Chat = function(id) {
	this.videoId = id;
	this.status = "loading";
	this.skipView = false;

	var self = this;

	$.get("https://api.twitch.tv/kraken/videos/" + id + "?client_id=88bxd2ntyahw9s8ponrq2nwluxx17q", function(vodData) {
		self.recordedTime = moment(vodData.recorded_at).utc();
		self.currentTime = self.recordedTime.clone();

		// http://dgg.overrustlelogs.net/Destinygg chatlog/March 2016/2016-03-23
		var overrustleLogsUrl = "http://dgg.overrustlelogs.net/Destinygg%20chatlog/" + 
			self.recordedTime.format("MMMM") + "%20" + 
			self.recordedTime.format("YYYY") + "/" + 
			self.recordedTime.format("YYYY") + "-" +
			self.recordedTime.format("MM") + "-" +
			self.recordedTime.format("DD") + ".txt";

		$.get("/chat", {
			url: overrustleLogsUrl
		}, function(data) {
			self.chat = JSON.parse(data);
			self.startChatStream();
		});
	});

	$("#play-button").click(function() {
		self.startChatStream();
		$("#play-button").hide();
		$("#stop-button").show();
	});

	$("#stop-button").click(function() {
		self.pauseChatStream();
		$("#stop-button").hide();
		$("#play-button").show();
	});

	$("#skip-view-button").click(function() {
		self.skipView = true;
		$("#non-skip-controls").hide();
		$("#skip-controls").css("display", "flex");
		$("#skip-time-input").focus().select();
	});

	$("#back-button").click(function() {
		self.skipView = false;
		$("#skip-controls").hide();
		$("#non-skip-controls").css("display", "flex");
	});

	$("#skip-button").click(function() {
		if (self._skipToTime($("#skip-time-input").val())) {
			self.skipView = false;
			$("#skip-controls").hide();
			$("#non-skip-controls").css("display", "flex");
		}
	});

	this.startChatStream = function() {
		this.status = "running";
	};

	this.pauseChatStream = function() {
		this.status = "paused";
	};

	this._skipToTime = function(timeString) {
		var timeValues = timeString.match(/(..):(..):(..)/);

		if (timeValues === null) {
			return false;
		}

		self.currentTime = self.recordedTime.clone()
												.add(timeValues[1], 'h')
												.add(timeValues[2], 'm')
												.add(timeValues[3], 's');
		$("#chat-stream").append("<div class='skip-message'>Skipping to " + timeString + "...</div>");

		return true;
	};

	this._formatMessage = function(message) {
		var messageReplaced = message.linkify();

		Object.keys(globals.destinyEmotes).forEach(function(emote) {
			messageReplaced = messageReplaced.replace(emote, self._generateDestinyEmoteImage(emote));
		});

		return this._greenTextify(messageReplaced);
	};

	this._generateDestinyEmoteImage = function(emote) {
		var styles = globals.destinyEmotes[emote];

		return "<div class='emote emote-" + emote + "' " + 
			"style='background-position: " + styles.backgroundPosition + "; " + 
			"width: " + styles.width + "; " + 
			"height: " + styles.height + "; " + 
			"margin-top: " + styles.marginTop + "'/>";
	};

	this._greenTextify = function(message) {
		if (message[0] === '>') {
			return "<span class='greentext'>" + message + "</span>";
		} else {
			return message;
		}
	}

	this._formatTimeNumber = function(number) {
		return ("0" + number).slice(-2);
	}

	this._formatTime = function(milliseconds) {
		var secondsTotal = milliseconds / 1000;
		var hours = Math.floor(secondsTotal / 3600)
		var minutes = Math.floor((secondsTotal - hours * 60) / 60);
		var seconds = secondsTotal % 60;

		return this._formatTimeNumber(hours) + ":" + 
					 this._formatTimeNumber(minutes) + ":" + 
					 this._formatTimeNumber(seconds);
	}

	window.setInterval(function() {
		if (self.status == "running" && self.chat) {
			var utcFormat = self.currentTime.format().replace("+00:00", "Z");
			if (self.chat[utcFormat]) {
				self.chat[utcFormat].forEach(function(chatLine) {
					$("#chat-stream").append("<div class='chat-line'>" + 
						"<span class='username'>" + 
						chatLine.username + "</span>: " + 
						"<span class='message'>" + 
						self._formatMessage(chatLine.message) + "</span></div>");
				});

				$("#chat-stream").animate({ 
					scrollTop: $("#chat-stream").prop("scrollHeight")
				}, 1000);
			}

			self.currentTime.add(1, 's');
			$("#chat-time").text(self._formatTime(self.currentTime - self.recordedTime));

			if (!self.skipView) {
				$("#skip-time-input").val(self._formatTime(self.currentTime - self.recordedTime));
			}
		}
	}, 1000);
};

String.prototype.linkify = function() {
	// http://, https://, ftp://
	var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
	// www. sans http:// or https://
	var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

	return this.replace(urlPattern, '<a class="externallink" href="$&">$&</a>')
						 .replace(pseudoUrlPattern, '$1<a class="externallink" href="http://$2">$2</a>');
};
