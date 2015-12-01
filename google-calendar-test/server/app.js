var express = require('express');
var http = require('http');
var path = require('path');
var moment = require('moment');
var momenttz = require('moment-timezone');
var _ = require('underscore');
//var time = require('time');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

/*
  ALGORITHM TO GET AVAILABILITY BETWEEN N USERS, WHERE N >= 2

  Reasonable Assumption: All events start AND end at the end of an hour OR 1/2 hour.

  availability_per_user map:
  k - calendarId/email that represents user,
  v - list of the unix epochs that represent start times for 1/2 hr slots in which the user is busy

  (1) times where everyone is busy = _.UNION of all user unix epoch arrays
  (2) all_available_times = generate all available times (on every hour or half an hour) in the next week from today (next version: between a user defined range)
  (3) times both are available = the _.DIFFERENCE of (1) and (2)

*/

var filteredTime = [];
// store calendar info for all users
var all_calendars_info = [];
// DT to represent user availability
var availability_per_user = {};
//server side socket io logic
var num_connection = 0;

var secsInAWeek = 60 * 60 * 24 * 7;
var secsIn30Min = 60 * 30;
var secsIn60Min = 60 * 30 * 2;

// list that represents all available times starting from the next hour until the next week
var generateAllAvailableTimes = function () {
    //var start = moment().format('YYYY-MM-DD') + 'T' + '00:00:00.000Z';
    //var end = moment(start).unix() + secsInAWeek;
    //end = moment().toISOString();
    var result = [];
    var start = Math.ceil(moment().unix() / 3600) * 3600; //round to next hour
    var end = start + secsInAWeek;
    console.log(start);
    
    while (start != end) {
        result.push(start);
        start += secsIn60Min;
    }
    return result;
}

var getTimesWhenEveryoneIsBusy = function () {
  return _.union.apply(_, _.values(availability_per_user));
}

var validateEmail = function (email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
}

/*
  This is what a single event looks like
  [ { kind: 'calendar#event',
    etag: '"2869517461150000"',
    id: '1okfl9ielk1bns32elalt1sc9c',
    status: 'confirmed',
    htmlLink: 'https://www.google.com/calendar/event?eid=MW9rZmw5aWVsazFibnMzMmVsYWx0MXNjOWMgbGZkZXBvbWJvQG0',
    created: '2015-06-20T00:05:30.000Z',
    updated: '2015-06-20T00:05:30.575Z',
    summary: 'Test',
    creator:
     { email: 'lfdepombo@gmail.com',
       displayName: 'Luis F De Pombo',
       self: true },
    organizer:
     { email: 'lfdepombo@gmail.com',
       displayName: 'Luis F De Pombo',
       self: true },
    start: { dateTime: '2015-06-19T16:30:00-07:00' },
    end: { dateTime: '2015-06-19T17:30:00-07:00' },
    iCalUID: '1okfl9ielk1bns32elalt1sc9c@google.com',
    sequence: 0,
    reminders: { useDefault: true } } ]
*/

var populateUserEventsMap = function (calendarId, item) {
  startTime = moment(item.start.dateTime).unix();
  endTime = moment(item.end.dateTime).unix();
  // the event can be as long as it wants
  while (startTime != endTime) {
    availability_per_user[calendarId].push(startTime);
    startTime += secsIn30Min;
  }
}

function filterTime(times){    
    if(filteredTime.length != 0){
        return filteredTime; //THIS IS A SHITTY MECHANISM TO make everyone get the same time. we r shit coders.
    }
    while(filteredTime.length < 5){
        var chosen = times[Math.floor(Math.random() * times.length)];
        var time = parseInt(momenttz.tz(parseInt(chosen) * 1000, "America/Los_Angeles").format("H"));
        if (time > 8 && time < 21){
            filteredTime.push(chosen);    
        }
    }
    filteredTime = filteredTime.sort();
    return filteredTime;
}

//======================= google shit ============================

var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;
var CLIENT_ID = '946971278198-7fr206fc94tbv6utquqdeaqllp9hlisr.apps.googleusercontent.com';
var CLIENT_SECRET = '7xq4JsK7WBqpf3l3l2GlxLc3';
var REDIRECT_URL = 'http://63867093.ngrok.com/oauth2callback';

var scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar',
    'profile',
    'email'
];

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
google.options({ auth: oauth2Client }); // set auth as a global default

// generate a url that asks permissions for Google Calendar scope
var authUrl = oauth2Client.generateAuthUrl({
  	access_type: 'offline',
    scope: scopes
});

// we now have access
app.get('/oauth2callback', function (req, res) {
	oauth2Client.getToken(req.query.code, function(err, tokens) {
  		if(!err) {
  			/* token looks like this
          { access_token: '',
  					token_type: '',
  					id_token: '',
  					refresh_token: '',
  					expiry_date: 1434688696461 
  				}
  			*/
  			//we need to set tokens, then use the oauth2Client as the param for auth
    		oauth2Client.setCredentials(tokens); 
    		//more on how to use the API:
    		//https://github.com/google/google-api-nodejs-client/blob/master/apis/calendar/v3.js
    		//http://www.matt-toigo.com/dev/pulling_google_calendar_events_with_node

    		calendar.calendarList.list({
    			auth: oauth2Client,
    			maxResults: 20
    		}, function(err, data){
    			data = data['items'];
    			for (var i = 0; i < data.length; i++){
            if (validateEmail(data[i]['id'])) {
              //console.log(data[i]['id']);
              //Collect ALL calendar ids for this user
              all_calendars_info.push(data[i]['id']);
              //Initialize availability for this user
              availability_per_user[data[i]['id']] = [];
            }
    			}

        });

        res.render('index.jade', {});
  		}
	});
});


//==============================================================

app.get('/', function (req, res) {
	res.redirect(authUrl);
    // res.render('index.jade', {});
})

app.get('/reset', function (req, res) {
    all_calendars_info = [];
    availability_per_user = {};
    num_connection = 0;
    filteredTime = [];
    res.send("it's reset now");
})

io.on('connection', function (socket) {
	//used to help count how many ppl r connected
	num_connection += 1; 

	//used to help count how many ppl r connected
	socket.on('disconnect', function () {
    	num_connection -= 1;
  });

	//update client on how many ppl r connected
	setInterval(function(){
		var context = {num: num_connection}; 
		socket.emit('update', context);
	}, 1000);

	//receive server auth information
	socket.on('match', function (data) {

        var start = moment().format('YYYY-MM-DD') + 'T' + '00:00:00.000Z';
        var end = moment(start).unix() + secsInAWeek;
        end = moment().toISOString();

        // generate availability based on matching
        all_calendars_info.map(function (calendarId){
            calendar.events.list({
                calendarId: calendarId,
                maxResults: 20,
                timeMin: start,
                timeMax: end,
                auth: oauth2Client
            }, function(err, events) {
                // console.log("EVENTS",events);
                if (events != null){
                    events.items.map(function (item){
                        populateUserEventsMap(calendarId, item);
                    });
                }
                var all_available_times = generateAllAvailableTimes();
                var all_busy_times = getTimesWhenEveryoneIsBusy();
                var meet_me_now = _.difference(all_available_times, all_busy_times);

                //filter time down
                var results = []
                filterTime(meet_me_now).map(function (unixTs){
                    results.push(momenttz.tz(parseInt(unixTs) * 1000, "America/Los_Angeles").format("dddd, MMMM Do YYYY, h a"));
                });
                //return meeting times
                io.sockets.emit('result', {dates:results});
            });
        });
	});
});


server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
