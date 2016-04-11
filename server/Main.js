// Basic imports to set up Express app & Socket.io
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Utils
var Constants = require('./Constants');
var MessageHandlers = require('./MessageHandlers');
var GameStore = require('./GameStore');
var toBase64 = require('./utils/toBase64');

// Handle routes
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/static', express.static('js'));

// Handle Socket.io communication
io.on('connection', function(socket) {
    // Give the socket a unique player ID
    socket.playerId = 'user_' + toBase64(Date.now());
    socket.join(socket.playerId);
    // Listen for the proper message types
    var eventTypes = Object.keys(MessageHandlers);
    for (var i = 0; i < eventTypes.length; i++) {
        var type = eventTypes[i];
        // We bind the socket to the handling function so it has a reference to it
        socket.on(type, MessageHandlers[type].bind(io, socket));
    }
});

// Start the server
http.listen(Constants.PORT_NUMBER, function() {
    console.log('Ghess server listening on port '+Constants.PORT_NUMBER);
});
