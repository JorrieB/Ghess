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
    'observe-game': function(socket){
        var game = GameStore.getFirstObservable();
        console.log('server observer ');

        if (game == null){
            console.log('could not find game');
            socket.emit('game-not-available',{});
        } else {
            console.log('found game');
            game.game.addObserver(socket.playerId);
            if (game.game.canStart()){
                socket.emit('update-state', game.game.serialize(socket.playerId));
            } else {
                socket.emit('waiting',{gameId: game.id});
            }
        }
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
            //create one!
            var created = GameStore.create();
            gameId = created.id;
            game = created.game;
            game.addPlayer(socket.playerId);
            socket.gameId = gameId;
            
            socket.emit('team-selection', { gameId: gameId, gameParams: game.getParams(socket.playerId) });


        } else {
            //join the one currently available
            gameId = available.id;
            game = available.game;
            game.addPlayer(socket.playerId);
            socket.gameId = gameId;

            socket.emit('team-selection', { gameId: gameId, gameParams: game.getParams(socket.playerId) });
        }

    },
    'ready-player': function(socket, data) {
        var game = GameStore.get(socket.gameId);
        // TODO: make ready take arguments with initial placement of characters
        socket.emit('player-readied');
        
        game.insertCharacters(data.characters,socket.playerId);

        if (game.canStart()){
            console.log('STARTING');
            socket.emit('update-state', game.serialize(socket.playerId));
            // To the other player
            var otherPlayerId = game.getOtherPlayerId(socket.playerId);
            this.to(otherPlayerId).emit('update-state', game.serialize(otherPlayerId));
        } else {
            console.log('GAME CANNOT START');
        }

    },
    'update-game': function(socket, data) {
    	var game = GameStore.get(socket.gameId);
    	var isValid = GameHandler(data, game, socket.playerId);
        console.log('updating game');
   		// Send result back
        if (isValid) {
            console.log('valid move');
            // To this player
            socket.emit('update-state', game.serialize(socket.playerId));
            // To the other player
            var otherPlayerId = game.getOtherPlayerId(socket.playerId);
            this.to(otherPlayerId).emit('update-state', game.serialize(otherPlayerId));
            // Send info to observers each time there was an update
            var observers = game.getObservers();
            for (observerIndex in observers){
                this.to(observers[observerIndex]).emit('update-state', game.serialize(observers[observerIndex]));
            }

            // If the game is over, notify the players
            potentialWinnerId = game.isGameOver()
            if (potentialWinnerId){
                console.log("Game is over!!")
                socket.emit('game-over', {winner: potentialWinnerId})
            }

        } else {
            // send back error
        }
    }
};
