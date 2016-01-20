/**
 * Determines if the provided value has been defined.
 *
 * @param {mixed} object
 * @returns {boolean}
 */
var isset = function(object) {
	return typeof object !== 'undefined';
};

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 * @param {string} value
 * @returns {string|null}
 */
var hash_key = function(value) {
	if (typeof value === 'undefined' || value === null) return null;
	if (typeof value === 'boolean') return value ? '1' : '0';
	return value + '';
};

/**
 * Escapes a string for use within HTML.
 *
 * @param {string} str
 * @returns {string}
 */
var escape_html = function(str) {
	return (str + '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
};

/**
 * Escapes "$" characters in replacement strings.
 *
 * @param {string} str
 * @returns {string}
 */
var escape_replace = function(str) {
	return (str + '').replace(/\$/g, '$$$$');
};

var hook = {};

/**
 * Wraps `method` on `self` so that `fn`
 * is invoked before the original method.
 *
 * @param {object} self
 * @param {string} method
 * @param {function} fn
 */
hook.before = function(self, method, fn) {
	var original = self[method];
	self[method] = function() {
		fn.apply(self, arguments);
		return original.apply(self, arguments);
	};
};

/**
 * Wraps `method` on `self` so that `fn`
 * is invoked after the original method.
 *
 * @param {object} self
 * @param {string} method
 * @param {function} fn
 */
hook.after = function(self, method, fn) {
	var original = self[method];
	self[method] = function() {
		var result = original.apply(self, arguments);
		fn.apply(self, arguments);
		return result;
	};
};

/**
 * Wraps `fn` so that it can only be invoked once.
 *
 * @param {function} fn
 * @returns {function}
 */
var once = function(fn) {
	var called = false;
	return function() {
		if (called) return;
		called = true;
		fn.apply(this, arguments);
	};
};

/**
 * Wraps `fn` so that it can only be called once
 * every `delay` milliseconds (invoked on the falling edge).
 *
 * @param {function} fn
 * @param {int} delay
 * @returns {function}
 */
var debounce = function(fn, delay) {
	var timeout;
	return function() {
		var self = this;
		var args = arguments;
		window.clearTimeout(timeout);
		timeout = window.setTimeout(function() {
			fn.apply(self, args);
		}, delay);
	};
};

/**
 * Debounce all fired events types listed in `types`
 * while executing the provided `fn`.
 *
 * @param {object} self
 * @param {array} types
 * @param {function} fn
 */
var debounce_events = function(self, types, fn) {
	var type;
	var trigger = self.trigger;
	var event_args = {};

	// override trigger method
	self.trigger = function() {
		var type = arguments[0];
		if (types.indexOf(type) !== -1) {
			event_args[type] = arguments;
		} else {
			return trigger.apply(self, arguments);
		}
	};

	// invoke provided function
	fn.apply(self, []);
	self.trigger = trigger;

	// trigger queued events
	for (type in event_args) {
		if (event_args.hasOwnProperty(type)) {
			trigger.apply(self, event_args[type]);
		}
	}
};

/**
 * A workaround for http://bugs.jquery.com/ticket/6696
 *
 * @param {object} $parent - Parent element to listen on.
 * @param {string} event - Event name.
 * @param {string} selector - Descendant selector to filter by.
 * @param {function} fn - Event handler.
 */
var watchChildEvent = function($parent, event, selector, fn) {
	$parent.on(event, selector, function(e) {
		var child = e.target;
		while (child && child.parentNode !== $parent[0]) {
			child = child.parentNode;
		}
		e.currentTarget = child;
		return fn.apply(this, [e]);
	});
};

/**
 * Determines the current selection within a text input control.
 * Returns an object containing:
 *   - start
 *   - length
 *
 * @param {object} input
 * @returns {object}
 */
var getSelection = function(input) {
	var result = {};
	if ('selectionStart' in input) {
		result.start = input.selectionStart;
		result.length = input.selectionEnd - result.start;
	} else if (document.selection) {
		input.focus();
		var sel = document.selection.createRange();
		var selLen = document.selection.createRange().text.length;
		sel.moveStart('character', -input.value.length);
		result.start = sel.text.length - selLen;
		result.length = selLen;
	}
	return result;
};

/**
 * Copies CSS properties from one element to another.
 *
 * @param {object} $from
 * @param {object} $to
 * @param {array} properties
 */
var transferStyles = function($from, $to, properties) {
	var i, n, styles = {};
	if (properties) {
		for (i = 0, n = properties.length; i < n; i++) {
			styles[properties[i]] = $from.css(properties[i]);
		}
	} else {
		styles = $from.css();
	}
	$to.css(styles);
};

var domToString = function(d) {
	var tmp = document.createElement('div');

	tmp.appendChild(d.cloneNode(true));

	return tmp.innerHTML;
};
