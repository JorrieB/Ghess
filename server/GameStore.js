// GameStore.js
// Stores games
var Game = require('./Game');
var toBase64 = require('./utils/toBase64');
var Game = require('./Game');

var games = {};

var generateId = function() {
    var newId = toBase64(Date.now());
    games[newId] = new Game();
    return newId;
};

module.exports = {
    // Creates a new game and returns the ID of the created game
    create: function() {
        // Use current time to make the ID unique, and convert to base 64 to shorten it
        return generateId();
    },
    // Gets a game given an ID
    get: function(id) {
        return games[id];
    },
    // Deletes the game with the given ID
    remove: function(id) {
        games[id] = null;
    },
    // Gets first game in dictionary
    getAny: function() {
        var gameIds = Object.keys(games);
        for (var i = 0; i < gameIds.length; i++) {
            var gameId = gameIds[i];
            var game = games[gameId];
            if (game.joinable()) {
                return gameId;
            }
        }
        return generateId();
    },
};
