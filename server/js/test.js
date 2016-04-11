var Game = require('../Game');

var game = new Game();
game.addPlayer("Jorrie");
game.addPlayer("Giulio");
game.staticStart();
console.log(game.serialize());
// console.log(game.getCharacters().map(function(character){
// 	character.serialize();
// }));
