var schema = require('./schema.js');
var init = require('./init.js');
var express = require('express');
var app = express();

init.init();

app.get('/', function (req, res) {
  res.send('Hello World!')
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('listening at http://%s:%s', host, port)

})