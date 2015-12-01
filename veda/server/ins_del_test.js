var jot = require("./jot/base.js");
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

var doc = {
	key1: "Hello World!",
	key2: 10,
};

console.log(doc);

var user2 = [
	jot.REM("key1"),
	jot.PUT("key3", "key1 was noob anyways.")
];
console.log(jot.apply_array(user2, clone(doc)));

