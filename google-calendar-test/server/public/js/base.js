//client-side socket io logic

var socket = io.connect('http://63867093.ngrok.com');
var num_connection_has_changed = false;

//updates num ppl involved
socket.on('update', function (data){
	// console.log(data);
	document.getElementById('num_connection').innerHTML = data['num'];
	num_connection_has_changed = true;
});

//checks if its ok to ask for calendar auth
setInterval(function(){
	if (parseInt(document.getElementById('num_connection').innerHTML) >= 2 && num_connection_has_changed){
		//generate suggestions when there is a match
		socket.emit('match', {auth: 'asd'});
		num_connection_has_changed = false; //stops server from generating suggestions again
	}		
}, 10000);

//post final meeting times
socket.on('result', function (data){
	console.log(data);
	var messagebox = document.getElementsByClassName('messagebox')[0];
	var message = document.getElementsByClassName('message')[0].cloneNode(true);
	var messages = document.getElementsByClassName('message');
	while(messages.length > 0){
    	messages[0].parentNode.removeChild(messages[0]);
    }
	var dates = data['dates'];
	for (var i = 0; i < dates.length; i++){
		var date = dates[i];
		var new_message = message.cloneNode(true);
		new_message.innerHTML = date;
		messagebox.appendChild(new_message);
	}
});
