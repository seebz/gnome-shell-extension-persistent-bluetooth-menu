
let enabled = true;

let format = "default";

let formats = {
	'reset'     : "\x1B[0m",
	'default'   : "\x1B[39m",
	'red'       : "\x1B[31m",
	'yellow'    : "\x1B[33m",
	'light-gray': "\x1B[37m",
	'dark-gray' : "\x1B[90m"
};


let toString = function() {
	return "[object Console]";
}

const log = function() {
	if (! enabled) return;
	for (var i = 0, length = arguments.length; i < length; i++) {
		_print(arguments[i]);
	}
};


const info = function() {
	if (! enabled) return;
	for (var i = 0, length = arguments.length; i < length; i++) {
		_print(arguments[i], "yellow");
	}
};


const warn = function() {
	if (! enabled) return;
	for (var i = 0, length = arguments.length; i < length; i++) {
		_print(arguments[i], "red");
	}
};


const debug = function() {
	if (! enabled) return;
	for (var i = 0, length = arguments.length; i < length; i++) {
		var obj = arguments[i],
			str = _debug(obj),
			format = "light-gray";

		if (format && formats[format]) {
			str = formats[format] + str + formats.reset;
		}
		print(str);
	}
};


function _print(obj, format) {
	var str = _toString(obj);
	if (format && formats[format]) {
		str = formats[format] + str + formats.reset;
	}
	print(str);
};


function _debug(obj, depth) {
	var out,
		type = typeof(obj),
		spaces = "\t".repeat(depth);

	if (obj instanceof Array || "" + obj === "[object Arguments]") {
		out = [];
		for (var i = 0, length = obj.length; i < length; i++) {
			out.push(_toString(obj[i])); // _toString, not _debug
		}
		out = "[" + out.join(',') + "]";
	}
	else if ("" + obj == toString()) {
		out = ["" + obj, ""];
	}
	else if (type === "object") {
		out = ["" + obj];
		for (var x in obj) {
			if (obj.hasOwnProperty(x)) {
				var str = _toString(obj[x], depth+1) // _toString, not _debug
					.replace(/^[\s]*/, '');
				out.push(spaces + " + " + x + ": " + str);
			}
		}
		for (var x in obj) {
			if (! obj.hasOwnProperty(x)) {
				var str = _toString(obj[x], depth+1) // _toString, not _debug
					.replace(/^[\s]*/, '');
				out.push(spaces + " - " + x + ": " + str);
			}
		}
		out.push("");
	}
	else if (type === "function") {
		out = ("" + obj).replace(/^([^)]+\))([^]*)$/g, '$1');
	}
	else {
		out = _toString(obj); // _toString, not _debug
	}

	if (out instanceof Array) {
		out = out.join(spaces + "\n");
	}
	return spaces + out;
};


function _toString(obj, depth) {
	var out,
		type = typeof(obj),
		spaces = "\t".repeat(depth);

	if (obj === undefined) {
		out = "undefined";
	}
	else if (obj === null) {
		out = "null";
	}
	else if (obj === true) {
		out = "true";
	}
	else if (obj === false) {
		out = "false";
	}
	else if (obj === "") {
		out = '""';
	}
	else if (obj instanceof Array || "" + obj === "[object Arguments]") {
		out = [];
		for (var i = 0, length = obj.length; i < length; i++) {
			out.push(_toString(obj[i], depth+1));
		}
		out = "[" + out.join(',') + "]";
	}
	else if (type === "function") {
		out = "function";
	}
	else {
		out = "" + obj;
	}

	if (out instanceof Array) {
		out = out.join(spaces + "\n");
	}
	return spaces + out;
}
