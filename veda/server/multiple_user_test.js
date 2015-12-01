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


var user1 = [
	jot.REN("key1", "title")
];
console.log(jot.apply_array(user1, clone(doc)));


var user3 = [
	jot.REN("key2", "count"),
	jot.PUT("key3", "LOLL")
];
console.log(jot.apply_array(user3, clone(doc)));


user2_rebased = jot.rebase_array(user1, user2);
user3_rebased = jot.rebase_array(user1, user3);
console.log(jot.apply_array(user1.concat(user2_rebased).concat(user3_rebased), clone(doc)));


