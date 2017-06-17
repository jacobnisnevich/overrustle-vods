var Chat = function(id, player) {
	this.videoId = id;
	this.status = "loading";
	this.skipView = false;
	this.videoPlayer = player;
	this.chatDelay = 8;
	this.previousTimeOffset = -1;

	this.previousMessage = '';
	this.comboCount = 1;

	var self = this;

	$.get('/users', function(data) {
		self._parseUserData(JSON.parse(data));
	});

	$.get("https://api.twitch.tv/kraken/videos/" + id + "?client_id=88bxd2ntyahw9s8ponrq2nwluxx17q", function(vodData) {
		self.recordedTime = moment(vodData.recorded_at).utc();

		// http://dgg.overrustlelogs.net/Destinygg chatlog/March 2016/2016-03-23
		var overrustleLogsMonth = "http://dgg.overrustlelogs.net/Destinygg%20chatlog/" + 
			self.recordedTime.format("MMMM") + "%20" + 
			self.recordedTime.format("YYYY") + "/" + 
			self.recordedTime.format("YYYY") + "-" +
			self.recordedTime.format("MM") + "-";

		var overrustleLogsDates = [
			overrustleLogsMonth + self.recordedTime.format("DD") + ".txt",
			overrustleLogsMonth + self.recordedTime.clone().add(1, 'days').format("DD") + ".txt"
		];
			
		$.get("/chat", {
			urls: JSON.stringify(overrustleLogsDates)
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

	this._parseUserData = function(data) {
		var styleString = "<style>\n";

		Object.keys(data).forEach(function(username) {
			styleString += ".user-" + username + " {\n";
			styleString += "\t color: " + data[username].color + " !important;\n";
			styleString += "}\n"
		});

		styleString += "</style>"

		$("head").append(styleString);
	};

	this._formatMessage = function(message) {
		var messageReplaced = message.linkify();

		Object.keys(globals.destinyEmotes).forEach(function(emote) {
			messageReplaced = messageReplaced.split(emote).join(self._generateDestinyEmoteImage(emote));
		});

		return this._greenTextify(messageReplaced);
	};

	this._renderComboMessage = function(emote, comboCount) {
		return self._generateDestinyEmoteImage(emote) + 
			"<span class='x'> x" + comboCount + " </span>" + 
			"<span class='combo'>C-C-C-COMBO</span>";
	}

	this._renderChatMessage = function(username, message) {
		var usernameField = "";
		if (username) {
			usernameField =  "<span class='username user-" + username + "'>" + username + "</span>: ";
		}

		$("#chat-stream").append("<div class='chat-line'>" + 
			usernameField + 
			"<span class='message'>" +
		  message + "</span></div>");		
	}

	this._generateDestinyEmoteImage = function(emote) {
		var styles = globals.destinyEmotes[emote];

		return "<div class='emote emote-" + emote + "' " + 
			"title='" + emote + "'" +
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
		var minutes = Math.floor((secondsTotal - hours * 3600) / 60);
		var seconds = secondsTotal % 60;

		return this._formatTimeNumber(hours) + ":" + 
					 this._formatTimeNumber(minutes) + ":" + 
					 this._formatTimeNumber(seconds);
	}

	window.setInterval(function() {
		if (self.status == "running" && self.chat) {
			var currentTimeOffset = Math.floor(self.videoPlayer.getCurrentTime());
			var utcFormat = self.recordedTime.clone().add(self.chatDelay + currentTimeOffset, 's').format().replace("+00:00", "Z");
			
			if (currentTimeOffset != self.previousTimeOffset && self.chat[utcFormat]) {
				self.chat[utcFormat].forEach(function(chatLine) {
					if (self.previousMessage == chatLine.message && globals.destinyEmotes[self.previousMessage]) {
						self.comboCount++;

						$('#chat-stream .chat-line').last().remove();
						var comboMessage = self._renderComboMessage(self.previousMessage, self.comboCount);
						self._renderChatMessage(null, comboMessage);
					} else {
						self.comboCount = 1;
						self._renderChatMessage(chatLine.username, self._formatMessage(chatLine.message));
					}

					self.previousMessage = chatLine.message;
				});

				$("#chat-stream").animate({ 
					scrollTop: $("#chat-stream").prop("scrollHeight")
				}, 1000);
			}

			self.previousTimeOffset = currentTimeOffset;
		}
	}, 1000);
};

// From https://stackoverflow.com/a/3890175
String.prototype.linkify = function() {
	// http://, https://, ftp://
	var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
	// www. sans http:// or https://
	var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

	return this.replace(urlPattern, '<a class="externallink" href="$&">$&</a>')
						 .replace(pseudoUrlPattern, '$1<a class="externallink" href="http://$2">$2</a>');
};
