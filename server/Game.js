var Game = function() {
	var _this = this;
    var _characters = [];
    var _gameObjects = [];
    var _boardSize = 7;
    var _maxTurnTime = 100;
    // Player turn is an integer for now. 0 means no one turn. 
    var _turn = 0;

    _this.insertCharacters = function(startCharacters){
        // For now, we just statically insert a list of characters
        _characters = startCharacters;
    };

    _this.getCharacters = function(){
        return _ _characters;
    };

    _this.handleMove = function(startPosition, endPosition){
        
    }

    _this.handleTurn = function(position, new_heading){

    }

    _this.handleAttack = function(attackerPosition, attackedPosition){

    }
};