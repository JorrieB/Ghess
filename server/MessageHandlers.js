var GameStore = require('./GameStore');
var GameHandler = require('./GameHandler');

// The socket message handlers.
// The first argument of each must be the socket
module.exports = {
    'create-game': function(socket, data) {
        // TODO: let users customize by passing parameters
        var gameId = GameStore.create();
        var game = GameStore.get(gameId);
        game.addPlayer(socket.playerId);
        // Store the gameId on the socket
        socket.gameId = gameId;
        // Send message back to client
        socket.emit('game-created', { gameId: gameId, gameParams: game.getParams() });
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
        var gameId = GameStore.getAny();
        var game = GameStore.get(gameId);;
        if (!gameId) {
            gameId = GameStore.create();
            game = GameStore.get(gameId);
            socket.emit('game-created', { gameId: gameId, gameParams: game.getParams() });
        }
        game.addPlayer(socket.playerId);
        socket.gameId = gameId;
        socket.emit('game-joined', { gameId: gameId, gameParams: game.getParams() });
    },
    'ready-player': function(socket, data) {
        var game = GameStore.get(socket.gameId);
        // TODO: make ready take arguments with initial placement of characters
        socket.emit('player-readied');
        // If both players are ready, start the game & send game state to clients
        if (game.canStart()) {
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
   		// Send result back
        if (isValid) {
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
