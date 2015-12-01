var jot = require("./jot/base.js");
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

var doc = {
	key1: "Hello World!",
	key2: 10,
};

console.log(doc);

//insert
var user2 = [
	jot.OBJECT_APPLY("key1", jot.INS(0, "LOL")),
];
//console.log(jot.apply_array(user2, clone(doc))); // { key1: 'LOLHello World!', key2: 10 }

//delete
var user3 = [
	jot.OBJECT_APPLY("key1", jot.DEL(0, "Hello")),
];
console.log(jot.apply_array(user3, clone(doc))); //{ key1: ' World!', key2: 10 }
