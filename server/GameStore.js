// GameStore.js
// Stores games
var Game = require('./Game');
var toBase64 = require('./utils/toBase64');
var Game = require('./Game');

var games = {};

module.exports = {
    // Creates a new game and returns the game ID and the created game
    create: function() {
        // Use current time to make the ID unique, and convert to base 64 to shorten it
        var newId = toBase64(Date.now());
        games[newId] = new Game();
        return { id: newId, game: games[newId] };
    },
    // Gets a game given an ID
    get: function(id) {
        return games[id];
    },
    // Deletes the game with the given ID
    remove: function(id) {
        games[id] = null;
    },
    // Gets first available game, and returns its ID and the game instance (or null if none exists)
    getFirstAvailable: function() {
        var gameIds = Object.keys(games);
        for (var i = 0; i < gameIds.length; i++) {
            var id = gameIds[i];
            if (games[id].joinable()) {
                return { id: id, game: games[id] };
            }
        }
        return null;
    },
};
