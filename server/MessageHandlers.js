var GameStore = require('./GameStore');
var GameHandler = require('./GameHandler');

// The socket message handlers.
// The first argument of each must be the socket
module.exports = {
    'create-game': function(socket, data) {
        var gameId = GameStore.create();
        // send id to clients
    },
    'update-game': function(socket, data) {
    	var game = GameStore.get(data.id);
    	var isValid = GameHandler(data, game);
   		// Send result back
   		if (isValid){
   			// TODO: pass it through some filter based upon socket
   			return game.state;
   		}
    }
};
//?? it's not socket, it's whoever we're sending it to
var ModifiedGameState = function(socket, game){
	switch(socket){
		case 'player1':
		break;
		case 'player2':
		break;
		default: //observer
		break;
	}
}