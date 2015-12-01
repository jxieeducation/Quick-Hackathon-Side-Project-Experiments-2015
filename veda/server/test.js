var jot = require("./jot/base.js");
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

var doc = {
	key1: "Hello World!",
	key2: 10,
};

console.log(doc);

var user2 = [
	jot.OBJECT_APPLY("key1", jot.SET("Hello World!", "Im the best")), // must provide the before and after values
	jot.OBJECT_APPLY("key2", jot.MAP('add', 10))
];
console.log(jot.apply_array(user2, clone(doc)));

