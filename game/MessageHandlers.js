var GameStore = require('./GameStore');

// The socket message handlers.
// The first argument of each must be the socket
// The 'this' reference is bound to the main socket.io instance
module.exports = {
    'disconnect' : function(socket){
        var gameID = socket.gameId;
        if (typeof gameID !== "undefined"){
            var game = GameStore.get(gameID);
            try {
                var participantType = game.removeParticipant(socket.playerId); //Figure out what kind of person left.
                if (participantType == "observer"){
                    console.log('Observer left game',gameID);
                } else {
                    console.log('Player left, game is being destroyed');
                    var otherPlayerId = game.getOtherPlayerId(socket.playerId);

                    var data = {
                        "winner":otherPlayerId
                    };

                    messageObservers(this, game.getObservers(),'game-over',data);
                    this.to(otherPlayerId).emit('game-over', data);


                    this.to(otherPlayerId).emit('update-state', game.serialize('observer'));
                    messageObservers(this, game.getObservers(),'update-state',game.serialize('observer'));


                    GameStore.remove(gameID);//all players have disconnected client side, now do garbage collection
                }

            } catch(err) {
                console.log('Could not find game.');
            }
        } else {
            console.log('Player was not connected to a game');
        }
    },
    'forfeit' : function(socket){
        var gameID = socket.gameId;
        if (typeof gameID !== "undefined"){
            var game = GameStore.get(gameID);
            try {
                var participantType = game.removeParticipant(socket.playerId); //Figure out what kind of person left.
                if (participantType == "player"){
                    console.log('Player left, game is being destroyed');

                    var otherPlayerId = game.getOtherPlayerId(socket.playerId);

                    var data = {
                        "winner":otherPlayerId
                    };
                    messageObservers(this, game.getObservers(),'forfeit',data);

                    this.to(otherPlayerId).emit('forfeit', data);

                    GameStore.remove(gameID);//all players have disconnected client side, now do garbage collection
                } else {
                    console.log("Observer forfeited...?");
                }

            } catch(err) {
                console.log('Could not find game.');
            }
        } else {
            console.log('Player was not connected to a game');
        }
    },
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
            socket.gameId = game.id;
            console.log("the observer's game id is ",socket.gameId);

            if (game.game.canStart()){
                socket.emit('update-state', game.game.serialize("observer"));
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
        try {
            socket.emit('player-readied');

            game.insertCharacters(data.characters,socket.playerId);

            if (game.canStart()){
                console.log('Starting game.');
                socket.emit('update-state', game.serialize(socket.playerId));
                // To the other player
                var otherPlayerId = game.getOtherPlayerId(socket.playerId);
                this.to(otherPlayerId).emit('update-state', game.serialize(otherPlayerId));
            } else {
                console.log('Game has only one player.');
            }
        } catch (err) {
            console.log('Cannot find game.');
        }


    },
    'update-game': function(socket, data) {
    	var game = GameStore.get(socket.gameId);

        try{
            var isValid = game.handleMessage(data, game, socket.playerId);

            console.log('updating game');
            // Send result back
            if (isValid) {
                console.log('Valid move.');
                // To this player
                socket.emit('update-state', game.serialize(socket.playerId));
                // To the other player
                var otherPlayerId = game.getOtherPlayerId(socket.playerId);
                console.log('about to send to other player');
                this.to(otherPlayerId).emit('update-state', game.serialize(otherPlayerId));
                // Send info to observers each time there was an update
                console.log('about to send to other player');
                messageObservers(this, game.getObservers(),'update-state',game.serialize('observer'));

                // If the game is over, notify the players
                gameOverInfo = game.isGameOver()
                if (gameOverInfo){
                    console.log("Game over!");
                    //Give everyone all information
                    socket.emit('update-state', game.serialize("observer"));
                    this.to(otherPlayerId).emit('update-state', game.serialize("observer"));
                    messageObservers(this, game.getObservers(),'update-state',game.serialize('observer'));
                    //Reveal the winner
                    socket.emit('game-over', gameOverInfo);
                    this.to(otherPlayerId).emit('game-over',gameOverInfo);
                    messageObservers(this, game.getObservers(),'game-over',gameOverInfo);
                    GameStore.remove(gameID);
                }
            } else {
                console.log('Move was not valid.');
            }

        } catch (err){
            console.log('Cannot update game, it does not exist.');
        }

    }
};


////////////////////////////
// Helper functions
////////////////////////////

//Message all observers in a game some message
var messageObservers = function(io, observers,message,data){
        for (index in observers){
            io.to(observers[index]).emit(message, data);
        }
}




