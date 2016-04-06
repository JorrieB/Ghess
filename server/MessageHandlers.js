var GameStore = require('./GameStore');

// The socket message handlers.
// The first argument of each must be the socket
module.exports = {
    'create-game': function(socket, data) {
        var gameId = GameStore.create();
        // send id to clients
    },
};
