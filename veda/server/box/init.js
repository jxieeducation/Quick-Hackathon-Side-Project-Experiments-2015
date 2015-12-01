//initial things that need to be done

var schema = require('./schema.js');

function init() {
	//note: id = 0 means that you are an admin
	schema.Log.remove(function (err) {
    	if (err) {
      		console.log(err);
    	}
  	});
	var log0 = new schema.Log({id:0, log:"veda server initiated."});
	log0.save(function (err) {if (err) console.log ('Error on save!')});

	console.log("server started successflly.");
}

module.exports = {
  init: init,
};
