/*global jQuery */
(function ($) {
	var VK_ESC = 27,
		VK_DOWN = 40,
		VK_UP = 38,
		VK_RETURN = 13,
		VK_LEFT = 37,
		VK_RIGHT = 39,
		VK_HOME = 36,
		VK_END = 35;

	function is(type, obj) {
		return Object.prototype.toString.call(obj) === "[object "+ type +"]";
	}
		
	function is_special_char(char_code) {
		return $.inArray(char_code, [VK_RETURN, VK_ESC, VK_UP, VK_DOWN,
			VK_LEFT, VK_RIGHT, VK_HOME, VK_END]) !== -1;
	}

	function convert_each_item_to_string(array_of_items) {
		for (var i = 0, len = array_of_items.length; i < len; i++) {
			array_of_items[i] = array_of_items[i].toString();
		}
		return array_of_items;
	}

	// TODO: refactor
	function prepare_input_parameters(items) {
		var options = [], i, len;
		if (is('Array', items)) {
			if (is('String', items[0])) {
				options.push({
					regex: /^(.*)$/,
					items: items
				});
			} else if (items[0].regex && items[0].items) {
				// TODO: make input parameters more configurable
				for (i in items) {
					if (is('Number', i)) {
						items[i].items = items[i].items;
					}
				}
				return items;
			}
		} else if (is('Object', items)) {
			for (i in items) {
				if (items.hasOwnProperty(i)) {
					if (is('Array', items[i])) {
						options.push({
							regex: new RegExp(i.length === 1 ? '\\' + i + '([^\\' + i + ']*)$' : i),
							items: items[i]
						});
					} else {
						options.push(items[i]);
					}
				}
			}
		}
		for (i = 0, len = options.length; i < len; i++) {
			options[i].items = convert_each_item_to_string(options[i].items);
		}
		return options;
	}

	function Context_Autocomplete(dom_input, items) {

		this.handle_special_char = function (char_code) {
			switch (char_code) {
			case VK_RETURN:
				this.apply_selected();
				return false;
			case VK_ESC:
				this.$menu.hide();
				return false;
			case VK_HOME:
			case VK_END:
				this.$menu.find('li.selected').removeClass('selected');
				this.$menu[0].firstChild[(char_code === VK_HOME ? 'first' : 'last') + 'Child'].className = 'selected';
				return false;
			case VK_DOWN:
			case VK_UP:
				var is_down_arrow = (char_code === VK_DOWN);
				var siblingNode = is_down_arrow ? 'nextSibling' : 'previousSibling';
				var limitNode = is_down_arrow ? 'first' : 'last';
				var $li = this.$menu.find('li.selected');
				if ($li.size() === 1) {
					if ($li[0][siblingNode]) {
						$($li[0][siblingNode]).addClass('selected');
						$li.removeClass('selected');
					}
				} else {
					this.$menu[0].firstChild[limitNode + 'Child'].addClass('selected');
				}
				return false;
			default:
				return true;
			}
		};

		/**
		 * returns count of items populated
		 */
		this.populate_with_items = function (items, value) {
			var options = [], item, len = items.length, i;
			if (typeof value === 'undefined') {
				value = '';
			} else {
				value = value.toLowerCase();
			}
			var first = true;
			for (i = 0; i < len; i++) {
				item = items[i];
				if (!item) {
					continue;
				}
				if (!value || item.toLowerCase().indexOf(value) === 0) {
					options.push('<li' + (first ? ' class="selected"' : '') +
						' onmouseover="jQuery(this).addClass(\'selected\').siblings(\'.selected\').removeClass(\'selected\')">' +
						'<strong>' + item.substr(0, value.length) + '</strong>' +
						item.substr(value.length) + '<\/li>');
					first = false;
				}
			}
			this.$menu.html('<ul>' + options.join('') + '<\/ul>');
			return options.length;
		};

		this.update_position = function (matched_part) {
			var absolute_offset = {left: this.input.offsetLeft, top: this.input.offsetTop};
			var op = this.input;
			while ((op = op.offsetParent)) {
				absolute_offset.left += op.offsetLeft;
				absolute_offset.top += op.offsetTop;
			}
			this.fix_ie_selection();
			this.$fake_input.html(this.input.value
				.substr(0, this.input.selectionStart - matched_part.length)
				.replace(/ /g, '&nbsp;')
			);
			var cursor_offset = this.$fake_input.width();
			
			absolute_offset.left += cursor_offset;
			absolute_offset.top += this.$input.height();
			
			this.$menu.css(absolute_offset);
		};

		var do_not_handle_twice;
		this.handle_literal_char = function (char_code) {
			var options = this.items;
			if (do_not_handle_twice === this.input.value) {
				//return;
			} else {
				do_not_handle_twice = this.input.value;
			}
			var val = this.input.value.substr(0, this.input.selectionStart),
				items = false, value_for_match;
			for (var i = 0, len = options.length; i < len; i++) {
				var res;
				if ((res = val.match(options[i].regex)) && res.length > 1) {
					items = options[i].items;
					value_for_match = res[1].toLowerCase();
					var found = false;
					for (var j in items) {
						if (items[j].toLowerCase().indexOf(value_for_match) !== -1) {
							found = true;
							break;
						}
					}
					if (found) {
						this.$menu.suffix = options[i].suffix || '';
						break;
					} else {
						items = false;
					}
				}
			}
			if (!items) {
				this.$menu.hide();
				return true;
			}
			var length = this.populate_with_items(items, value_for_match);
			if (length > 0 && this.$menu.is(':hidden')) {
				this.update_position(value_for_match);
				this.$menu.show();
			} else if (length === 0 && this.$menu.is(':visible')) {
				this.$menu.hide();
			}
		};

		this.handle_change = function (e) {
			var self = this;
			e = e || window.event;
			var char_code = e.keyCode || e.charCode;
			if (!char_code) {
				return true;
			}
			if (is_special_char(char_code)) {
				if (this.$menu.is(':visible') && !this.handle_special_char(char_code)) {
					return false;
				}
			} else {
				setTimeout(function () {
					self.fix_ie_selection();
					self.handle_literal_char(char_code);
				}, 100);
			}
		};

		this.fix_ie_selection = function () {
			if (!$.browser.msie) {
				return false;
			}
			var r = this.input.createTextRange();
			try {
				r.setEndPoint('EndToStart', document.selection.createRange());
			} catch (e) {
				
			}
			this.input.selectionStart = r.text.length;
			this.input.selectionEnd = this.input.selectionStart + r.text.length;
			return true;
		};

		this.apply_selected = function () {
			if (this.$menu.is(':hidden')) {
				return true;
			}
			this.fix_ie_selection();
			var $li = this.$menu.find('li.selected');
			var after_cursor = this.input.value.substr(this.input.selectionEnd);
			var before_cursor = this.input.value.substr(0, this.input.selectionStart);
			var matched_part = $li.html().match(/<strong>(.*?)<\/strong>/i)[1] || '';

			before_cursor = before_cursor.substr(0, before_cursor.length -
				matched_part.length) + matched_part;

			this.input.value = before_cursor +
				$li.html().replace(/<strong>.*?<\/strong>/i, '') +
				this.$menu.suffix + after_cursor;

			this.$menu.hide();
			this.input.focus();
		};

		this.init_fake_input = function () {
			var css = {}, $i = this.$input;
			$(['font-size', 'font-family', 'font-weight', 'border']).each(function (i, rule) {
				css[rule] = $i.css(rule);
			});
			return $('<div style="float: left; display: none;"><\/div>').css(css);
		};

		this.init = function (dom_input, items) {
			var self = this;
			
			this.items = items;
			this.input = dom_input;
			this.input.context_autocomplete = self;
			this.$input = $(dom_input);
			this.$menu = $('<div class="autocomplete_menu"><\/div>');
			this.$fake_input = this.init_fake_input();
			
			$('body').append(this.$fake_input).append(this.$menu);
			
			this.$input.attr('autocomplete', 'off');
			
			this.$menu.click(function () {
				self.apply_selected();
			});
			
			this.$input.blur(function () {
				setTimeout(function () {
					self.$menu.hide();
				}, 200);
			});
			
			// todo: test old keypress
			var old_onkeypress = this.input.onkeypress;
			this.input.onkeypress = function (e) {
				var handled = self.handle_change(e);
				if (typeof handled === 'boolean') {
					return handled;
				} else {
					return $.isFunction(old_onkeypress) ? old_onkeypress(e) : true;
				}
			};
			// todo: test old keydown
			if (!$.browser.mozilla && !$.browser.opera) {
				var old_onkeydown = this.input.onkeydown;
				this.input.onkeydown = function (e) {
					var handled = self.handle_change(e);
					if (typeof handled === 'boolean') {
						return handled;
					} else {
						return $.isFunction(old_onkeydown) ? old_onkeydown(e) : true;
					}
				};
			}
		};

		this.init(dom_input, items);

	}
	
	/*
	 * @param options should be Object with members - characters
	 * example:
	 * var options = {
	 *     '#': ['tag1', 'tag2', 'tag3'], // popup when # sign is typed
	 *     '@': ['place1', 'place2'],     // popup when @ sign is typed
	 *      '^\\d+\\s+(.*)$': categories  // popup when regex /^\d+\s+(.*)$/i is matched
	 * }
	 */
	$.fn.autocomplete = function (items) {
		if (!items) {
			return this;
		}
		var options = prepare_input_parameters(items);
		return this.each(function () {
			var x = new Context_Autocomplete(this, options);
		});
	};
})(jQuery);
