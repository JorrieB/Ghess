// Basic imports to set up Express app & Socket.io
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Utils
var Constants = require('./Constants');
var MessageHandlers = require('./MessageHandlers');
var GameStore = require('./GameStore');

// Handle routes
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Handle Socket.io communication
io.on('connection', function(socket) {
    // Listen for the proper message types
    var eventTypes = Object.keys(MessageHandlers);
    for (var i = 0; i < eventTypes.length; i++) {
        var type = eventTypes[i];
        // We bind the socket to the handling function so it has a reference to it
        socket.on(type, MessageHandlers[type].bind(null, socket));
    }
});

// Start the server
http.listen(Constants.PORT_NUMBER, function() {
    console.log('Ghess server listening on port '+Constants.PORT_NUMBER);
});
