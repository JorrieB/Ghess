// GameStore.js
// Stores games

var toBase64 = require('./utils/toBase64');

var games = {};

module.exports = {
    // Creates a new game and returns the ID of the created game
    create: function() {
        // Use current time to make the ID unique, and convert to base 64 to shorten it
        var newId = toBase64(Date.now());
        games[newId] = new Game();
        return newId;
    },
    // Gets a game given an ID
    get: function(id) {
        return games[id];
    },
    // Deletes the game with the given ID
    remove: function(id) {
        games[id] = null;
    },
};
