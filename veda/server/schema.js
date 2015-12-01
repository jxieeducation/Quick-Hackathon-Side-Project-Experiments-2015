var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/veda');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});

var logSchema = mongoose.Schema({
    id: Number,
    log: String,
})

var Log = mongoose.model('Log', logSchema);

module.exports = {
  Log: Log,
};
