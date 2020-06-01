$(document).ready(function() {

		//stolen from dgg chat Blesstiny
		this.focused = "";
		var self = this;

		this._addFocusRule = function(username) {
			self._removeFocusRule();
			let rule = `.chat-line[data-username="${username}"]{opacity:1 !important;}`;
			window.document.styleSheets[2].insertRule(rule);
			self.focused = username;
			self._redraw();
		}

		this._removeFocusRule = function() {
			if (self.focused) {
				window.document.styleSheets[2].deleteRule(0);
				self.focused = "";
				self._redraw();
			}
		}

		this._redraw = function () {
			$("#chat-stream").toggleClass('hide-on-focus', this.focused.length > 0);
		}
	}
)