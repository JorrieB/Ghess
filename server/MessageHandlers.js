var GameStore = require('./GameStore');
var GameHandler = require('./GameHandler');

// The socket message handlers.
// The first argument of each must be the socket
// The 'this' reference is bound to the main socket.io instance
module.exports = {
    'create-game': function(socket, data) {
        // TODO: let users customize by passing parameters
        var created = GameStore.create();
        created.game.addPlayer(socket.playerId);
        // Store the gameId on the socket
        socket.gameId = created.id;
        // Send message back to client
        socket.emit('game-created', { gameId: created.id, gameParams: created.game.getParams() });
    },
    'join-game': function(socket, data) {
        var game = GameStore.get(data.gameId);
        // TODO: check if player can actually join game (e.g. game doesn't already have 2 players, etc)
        game.addPlayer(socket.playerId);
        // Store gameId on the socket
        socket.gameId = data.gameId;
        // Send message back to client
        socket.emit('game-joined', { gameId: data.gameId, gameParams: game.getParams() });
    },
    'join-any': function(socket) {
        var available = GameStore.getFirstAvailable();
        var gameId;
        var game;
        if (!available) {
            var created = GameStore.create();
            gameId = created.id;
            game = created.game;
        } else {
            gameId = available.id;
            game = available.game;
        }
        game.addPlayer(socket.playerId);
        socket.gameId = gameId;
        socket.emit('game-joined', { gameId: gameId, gameParams: game.getParams() });
    },    
    'team-selection': function(socket, data){
        // console.log('1');
        // console.log(socket);
        // console.log(socket.gameId);
        // console.log('2');
        // var game = GameStore.get(socket.gameId);

        // var roster = game.getRoster();
        var roster = ["archer","swordsman","scout"];
        // var numChars = game.getNumChars();
        var numChars = 5;

        socket.emit('team-selection', {roster:roster, numChars:numChars});
    },
    'ready-player': function(socket, data) {
        var game = GameStore.get(socket.gameId);
        // TODO: make ready take arguments with initial placement of characters
        socket.emit('player-readied');
        // If both players are ready, start the game & send game state to clients
        if (game.canStart()) {
            game.staticStart(); // TODO: replace with actual start function
            // To this player
            socket.emit('update-state', game.serialize(socket.playerId));
            // To the other player
            var otherPlayerId = game.getOtherPlayerId(socket.playerId);
            this.to(otherPlayerId).emit('update-state', game.serialize(otherPlayerId));
        }
    },
    'update-game': function(socket, data) {
    	var game = GameStore.get(socket.gameId);
    	var isValid = GameHandler(data, game, socket.playerId);
        console.log('1 updating game');
   		// Send result back
        if (isValid) {
            console.log('2 valid move');
            // To this player
            socket.emit('update-state', game.serialize(socket.playerId));
            // To the other player
            var otherPlayerId = game.getOtherPlayerId(socket.playerId);
            this.to(otherPlayerId).emit('update-state', game.serialize(otherPlayerId));
        } else {
            // send back error
        }
    }
};
