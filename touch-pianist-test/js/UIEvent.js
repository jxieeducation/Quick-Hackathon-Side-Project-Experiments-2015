$(document).ready(function() {
    $(document).keydown(function(e) {
    	if (e.keyCode == '32') {
    		console.log("space down");
    	}
    });

    $(document).keyup(function(e) {
    	if (e.keyCode == '32') {
    		console.log("space up");
    	}
    });

});

