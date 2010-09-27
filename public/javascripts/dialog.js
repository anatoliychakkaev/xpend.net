var Dialog = (function () {
    // shortcuts
    var undefined, window = this,
    // utils
    $ = {
        ie6: false,
        calc_screen_bounds: function () {
            // Calc visible screen bounds (this code is common)
            var w = 0, h = 0;
            if (typeof(window.innerWidth) === 'number') {// не msie
                w = window.innerWidth;
                h = window.innerHeight;
            } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                w = document.documentElement.clientWidth;
                h = document.documentElement.clientHeight;
            }
            return {w: w, h: h};
        },
        calc_drag_bounds: function (el) {
            var b = this.calc_screen_bounds();
            // check vertical scrollbar
            if (b.h < document.body.offsetHeight) {
                b.w -= this.get_scrollbar_width();
            }
            // check horizontal scrollbar
            if (b.w < document.body.offsetWidth) {
                b.h -= this.get_scrollbar_width();
            }
            return {
                minX: 0,
                minY: 0,
                maxX: Math.max(0, b.w - el.offsetWidth),
                maxY: Math.max(0, b.h - el.offsetHeight)
            };
        },
        add_event: function (element, events, callback) {
            var i, len;
            if (this.is_array(element)) {
                for (i = 0, len = element.length; i < len; i++) {
                    this.add_event(element[i], events, callback);
                }
                return;
            }
            events = events.split(' ');
            for (i = 0, len = events.length; i < len; i++) {
                var event = events[i];
                if (element.attachEvent) {
                    element.attachEvent('on' + event, callback);
                } else {
                    element.addEventListener(event, callback, false);
                }
            }
        },
        remove_event: function (element, event, callback) {
            if (element.detachEvent) {
                element.detachEvent('on' + event, callback);
            } else {
                element.removeEventListener(event, callback, false);
            }
        },
        is_array: function (obj) {
            return obj && obj.constructor === Array;
        },
        /**
         * each
         * @param Array collection - collection to loop through
         * @param Function callback - function which will be called for 
         * each element of collection
         * when callback returns false loop is breaks
         */
        each: function (collection, callback) {
            var i, len;
            if (this.is_array(collection)) {
                for (i = 0, len = collection.length; i < len; i++) {
                    if (callback(i, collection[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i in collection) {
                    if (collection.hasOwnProperty(i)) {
                        if (callback(i, collection[i]) === false) {
                            break;
                        }
                    }
                }
            }
        },
    };

    // dialog
    window.show_modal_dialog = function (options, contents_div, callback) {
        var dialog = new Dialog(options);
        if (!contents_div) {
            contents_div = document.createElement('div');
            contents_div.innerHTML = '<p>Hello, world! Are you OK? Or Cancel?</p>';
        }
        dialog.content(contents_div);
        dialog.show();
        if (callback) {
            dialog.bind('commit', callback);
        }
        return dialog;
    };

    window.alert = function (s) {
        show_modal_dialog({
            width:      400,
            caption:    'Javascript alert',
            class_name: 'error'
        }, s);
    };

    function init_params(dialog, options, defaults) {
        dialog.options = options || {};
        $.each(defaults, function (name, value) {
            if (dialog.options[name] === undefined) {
                dialog.options[name] = value;
            }
        });
    }

    // private attributes
    var _private = {}, id = 0, scroll_stack = [], resize_stack = [], close_stack = [];

    // private methods
    function private(obj, name, value) {
        if (value !== undefined) {
            _private[obj.id()][name] = value;
        } else {
            return _private[obj.id()][name];
        }
    }

    function fire(event, obj) {
        var events = private(obj, 'events');
        if (!events[event]) {
            return true;
        }
        var fail = false;
        $.each(events[event], function (i, f) {
            var local_result = true;
            if (typeof f === 'function') {
                local_result = f(obj);
            }
            if (local_result === false) {
                fail = true;
            }
            return local_result;
        });
        return !fail;
    }

    /**
     * Dialog - main constructor
     * @param params Array
     */
    function Dialog(params) {
        init_params(this, params, {
            width: 300,
            caption: 'Modal dialog'
        });

        id += 1;
        var _id = id;
        this.id = function () {
            return _id;
        };

        var descr_div = document.createElement('div');
        descr_div.className = 'dialog_content';

        _private[this.id()] = {};
        private(this, 'content_holder', descr_div);
        private(this, 'events', {});
    }

    /**
     * show
     * display dialog
     */
    Dialog.prototype.show = function () {

        function dom_el(name, params, parent) {
            var el = document.createElement(name);
            $.each(params, function (key, val) {
                if (key === 'style') {
                    $.each(params.style, function (name, value) {
                        el.style[name] = value;
                    });
                } else {
                    el[key] = val;
                }
            });
            if (parent) {
                parent.appendChild(el);
            }
            return el;
        }
        var self = this, bounds = $.calc_screen_bounds();

        var overlay_opacity = dom_el('div', {
            className: 'overlay_opacity',
            style: {
                position: $.ie6 ? 'absolute' : 'fixed',
                width: '100%',
                height: '100%',
                backgroundColor: 'gray',
                opacity: '0.5',
                zIndex: 1000
            }
        }, document.body);
        private(this, 'overlay_opacity', overlay_opacity);

        var overlay = dom_el('div', {
            className: 'overlay',
            style: {
                position: $.ie6 ? 'absolute' : 'fixed',
                width: '100%',
                height: '100%'
            }
        }, document.body);
        private(this, 'overlay', overlay);

        if ($.ie6) {
            var scroll = function () {
                var s = $.calc_scroll();
                overlay.style.top = s.y + 'px';
                overlay.style.left = s.x + 'px';
            };
            window.onscroll = scroll;
            scroll_stack.push(scroll);
            scroll();
        } else {
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay_opacity.style.top = 0;
            overlay_opacity.style.left = 0;
        }

        var dialog_wrapper = dom_el('div', {
            className: 'dialog_wrap' + (self.options.class_name ? ' ' + self.options.class_name : ''),
            style: {
                zIndex: 1002,
                width: self.options.width ? self.options.width + 'px' : 'auto',
                height: self.options.height ? self.options.height + 'px' : 'auto'
            }
        }, overlay);

        var dialog = dom_el('div', { className: 'dialog_window' }, dialog_wrapper);

        var header = dom_el('div', {
            innerHTML: self.options.caption,
            className: 'dialog_caption'
        }, dialog);

        // make header draggable
        var init_pos = {x: 0, y: 0, t: 0, l: 0};
        header.onmousedown = function (e) {
            e = e || window.event;
            init_pos.x = e.clientX;
            init_pos.y = e.clientY;
            init_pos.t = dialog_wrapper.offsetTop;
            init_pos.l = dialog_wrapper.offsetLeft;
            
            var drag_shadow = dom_el('div', {
                className: 'drag_shadow',
                style: {
                    display: 'block',
                    left: dialog_wrapper.style.left,
                    top: dialog_wrapper.style.top,
                    width: dialog_wrapper.offsetWidth + 'px',
                    height: dialog_wrapper.offsetHeight + 'px'
                }
            }, overlay);

            // todo: make function calc_drag_bounds working correctly after first call
            init_pos.bounds = $.calc_drag_bounds(dialog_wrapper);
            init_pos.bounds = $.calc_drag_bounds(dialog_wrapper);
            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmouseup = null;
                dialog_wrapper.style.left = drag_shadow.style.left;
                dialog_wrapper.style.top = drag_shadow.style.top;
                overlay.removeChild(drag_shadow);
            };
            document.onmousemove = function (e) {
                e = e || window.event;
                var x = init_pos.l + e.clientX - init_pos.x;
                var y = init_pos.t + e.clientY - init_pos.y;
                x = Math.max(x, init_pos.bounds.minX);
                x = Math.min(x, init_pos.bounds.maxX);
                y = Math.max(y, init_pos.bounds.minY);
                y = Math.min(y, init_pos.bounds.maxY);
                drag_shadow.style.left = x + 'px';
                drag_shadow.style.top = y + 'px';
            };
            return false;
        };

        var fix_position_after_resize = function (e) {
            var x = parseInt(dialog_wrapper.style.left, 10);
            var y = parseInt(dialog_wrapper.style.top, 10);
            var bounds = $.calc_drag_bounds(dialog_wrapper);
            dialog_wrapper.style.left = Math.min(x, bounds.maxX) + 'px';
            dialog_wrapper.style.top = Math.min(y, bounds.maxY) + 'px';
        };
        window.onresize = fix_position_after_resize;
        resize_stack.push(fix_position_after_resize);

        var descr_div = private(this, 'content_holder');
        dialog.appendChild(descr_div);

        var footer = dom_el('div', { className: 'dialog_footer' }, dialog);

        this.buttons = {
            commit: dom_el('button', {
                innerHTML: 'OK',
                onclick: function () {
                    self.commit();
                }
            }, footer),
            cancel: dom_el('button', {
                innerHTML: 'Cancel',
                onclick: function () {
                    self.close();
                }
            }, footer)
        };
        fire('draw_commit', this);
        fire('draw_cancel', this);

        dialog_wrapper.style.left = Math.round((overlay.offsetWidth - dialog_wrapper.offsetWidth) / 2) + 'px';
        dialog_wrapper.style.top = Math.round((overlay.offsetHeight - dialog_wrapper.offsetHeight) / 2) + 'px';

        overlay.style.visibility = 'visible';

        var close_on_esc = function (e) {
            if (e.keyCode == 27) {
                self.close();
            }
        };
        if (close_stack.length > 0) {
            $.remove_event(window, 'keydown', close_stack[close_stack.length - 1]);
        }
        close_stack.push(close_on_esc);
        $.add_event(window, 'keydown', close_on_esc);
    };

    Dialog.prototype.content = function (html) {
        var descr_div = private(this, 'content_holder');
        if (!html) {
            return descr_div.firstChild;
        }
        if (html.nodeName && html.nodeType) {
            var node = descr_div.firstChild, next;
            while (node) {
                next = node.nextSibling;
                descr_div.removeChild(node);
                node = next;
            }
            descr_div.appendChild(html);
        } else {
            descr_div.innerHTML = html;
        }
        return descr_div.firstChild;
    };

    Dialog.prototype.commit = function () {
        if (fire('commit', this)) {
            this.close();
        }
    };

    Dialog.prototype.close = function () {
        if (fire('before_close', this)) {
            var overlay = private(this, 'overlay');
            var overlay_opacity = private(this, 'overlay_opacity');
            overlay.parentNode.removeChild(overlay);
            overlay_opacity.parentNode.removeChild(overlay_opacity);
            if ($.ie6) {
                scroll_stack.pop();
                window.onscroll = scroll_stack.length > 0 ? scroll_stack[scroll_stack.length - 1] : null;
            }
            resize_stack.pop();
            window.onresize = resize_stack.length > 0 ? resize_stack[resize_stack.length - 1] : null;
            $.remove_event(window, 'keydown', close_stack.pop());
            if (close_stack.length > 0) {
                $.add_event(window, 'keydown', close_stack[close_stack.length - 1]);
            }
            
            fire('after_close', this);
        }
    };

    Dialog.prototype.bind = function (event, handler) {
        var events = private(this, 'events');
        if (!events[event]) {
            events[event] = [];
        }
        events[event].push(handler);
    };

    Dialog.prototype.unbind = function (event, handler) {
        var events = private(this, 'events');
        if (!handler) {
            event[events] = false;
        } else if (events[event]) {
            $.each(events[event], function (i, f) {
                if (f === handler) {
                    events[event][i] = false;
                }
            });
        }
    };

    return Dialog;
})();
