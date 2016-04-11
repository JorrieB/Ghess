var Game = require('../Game');
var Archer = require('./archer');

var archer = new Archer({x:0, y:1}, {x:0, y:1}, "Eric");
console.log(archer.getAttackableCells());


// var game = new Game();
// game.addPlayer("Jorrie");
// game.addPlayer("Giulio");
// game.staticStart();
// console.log(game.serialize());
