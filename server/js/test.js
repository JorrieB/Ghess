// var Game = require('../Game');

// // var archer = new Archer({x:0, y:1}, {x:0, y:1}, "Eric");
// // console.log(archer.getAttackableCells());


// var game = new Game();
// game.addPlayer("Jorrie");
// game.addPlayer("Giulio");
// console.log(game.staticStart());




// var giulo = [{ characterType: 'swordsman',
//     position: { x: 5, y: 6 },
//     heading: { x: 0, y: -1 },
//     playerId: 'Giulio' },
//   { characterType: 'archer',
//     position: { x: 6, y: 6 },
//     heading: { x: 0, y: -1 },
//     playerId: 'Giulio' },
//   { characterType: 'scout',
//     position: { x: 4, y: 6 },
//     heading: { x: 0, y: -1 },
//     playerId: 'Giulio' } ] ;
// var jorrie = ({ characterType: 'swordsman',
//     position: { x: 0, y: 0 },
//     heading: { x: 0, y: 1 },
//     playerId: 'Jorrie' },
//   { characterType: 'archer',
//     position: { x: 4, y: 5 },
//     heading: { x: 0, y: 1 },
//     playerId: 'Jorrie' },
//   { characterType: 'scout',
//     position: { x: 2, y: 0 },
//     heading: { x: 0, y: 1 },
//     playerId: 'Jorrie' });

// console.log(game.serialize("Giulio").HUD);

var _boardSize = 7;

_getPlaceableSquares = function(playerID){
        squares = [];
        var player = playerID; //gives us either 1 or 2
        //player = 1
        // 0 + 1 
        var baseY = player * (1 + (_boardSize/2 | 0));
        console.log('baseY is ', baseY);
        for (x = 0; x < _boardSize; x++){
            for (y = baseY; y < baseY + (_boardSize/2 | 0); y++){
                squares.push({'x':x,'y':y});
            }
        }
        return squares;
    }

console.log("PLAYER 1: ",_getPlaceableSquares(0));

console.log("PLAYER 2: ",_getPlaceableSquares(1));

console.log('should be 3',(_boardSize/2 | 0));



