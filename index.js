// Setting up express.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Setting up socket.io
var io = require('socket.io').listen(server);

// Setting up server
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
server.listen(port, ipaddress);

// Setting up template engine `ejs`
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Setting up cookieParser, different in v3
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Setting up default directories
app.use('/assets', express.static(__dirname + '/bower_components/'));
app.use('/web', express.static(__dirname + '/web/'));



// Working with routes
app.get('/', function(req, res) {
	res.redirect('/c/' + getRandomString(15));
});

app.get('/c/:chatID', function(req, res) {
	app.locals.chatID = req.params.chatID;
	//app.locals.cookies = req.cookies;
	
	if (typeof req.cookies.userID === 'undefined')
		req.cookies.userID = getRandomString(10);
	
	res.render('index.ejs', { chatID:req.params.chatID, userID:req.cookies.userID });
});



// socket.io onMessageReceived
io.sockets.on('connection', function(socket) {
	socket.on('sendMessage_' + app.locals.chatID, function(data) {
		io.sockets.emit('viewMessage_' + app.locals.chatID, data);
	});
});


// Generates random string
function getRandomString(max) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
    for(var i=0; i < max; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}