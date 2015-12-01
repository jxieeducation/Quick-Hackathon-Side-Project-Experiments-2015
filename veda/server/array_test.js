var jot = require("./jot/base.js");
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

var doc = {
	key1: [1, 2, 3],
};

console.log(doc);

//move arr element
var user2 = [
	jot.OBJECT_APPLY("key1", jot.MOVE(0, 1, 3))
];
// console.log(jot.apply_array(user2, clone(doc))); //{ key1: [ 2, 3, '1' ] }


//set whole array
var user3 = [
	jot.OBJECT_APPLY("key1", jot.SET([1, 2, 3], [2, 2, 3]))
];
// console.log(jot.apply_array(user3, clone(doc))); //{ key1: [ 2, 2, 3 ] }


//array_apply op
var user4 = [
	jot.OBJECT_APPLY("key1", jot.ARRAY_APPLY(0, jot.SET(1, 2)))
];
// console.log(jot.apply_array(user4, clone(doc))); //{ key1: [ 2, 2, 3 ] }
