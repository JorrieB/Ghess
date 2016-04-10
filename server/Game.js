var Game = function() {
	var _this = this;
    var _characters = [];
    var _gameObjects = [];
    var _boardSize = 7;
    var _maxTurnTime = 100;
    var _numberOfMoves = 0;     // Number of moves since the beginning of the game
    var _movePerTurn = 2;

    // Spooky modular arithmetic for eric
    // Return 1 if this is player's 1 turn, 2 if this is player 2 turn
    _getActivePlayerId = function(){
        var turnNumber = Math.floor(_numberOfMoves / _movePerTurn);
         return (turnNumber % 2 ) + 1
    }

   _isPlayerMove = function(playerId){
        return (playerId == _getActivePlayerId())
    }

    // Return null if there are no characters, return the first character if there are more than 1 character
    _getCharacterAtPosition = function(position){
        characterAtPosition = null;
        charactersAtPosition = [];

        for (character in _characters){
            if (character.getPosition() == position){
                charactersAtPosition.push(character);
            }
        }

        switch(charactersAtPosition.length) {
        case 0:
            Console.log("Warning: There are no characters at this position");
            break;
        case 1:
            characterAtPosition = charactersAtPosition[0];
            break;
        default:
            // Weird case in wich there are more than one characters in one position 
            Console.log("Warning: There are multiple character in this position")
            characterAtPosition = charactersAtPosition[0];
        }
        return characterAtPosition;
    }

    _destroyCharacter = function(character){
        var characterIndex = _characters.indexOf(character);
        // If there is no such character, return false
        if (characterIndex == -1){
            return false;
        }

        _characters.splice(characterIndex, 1);
        return true;
    }

    // Public analog of functions above 
    _this.getActivePlayerId = function(){
        return _getActivePlayerId();
    }

    _this.isPlayerMove = function(playerID){
        return _isPlayerMove(playerId);
    }

    _this.getCharacterAtPosition = function(position){
        return _getCharacterAtPosition(position);   
    }

    _this.insertCharacters = function(startCharacters){
        // For now, we just statically insert a list of characters
        _characters = startCharacters;
        turn = 1;
    };

    _this.getCharacters = function(){
        return _characters;
    };

    _this.destroyCharacter = function(character){
        return _destroyCharacter(character);
    }
    //Handler for the moves that change the game state:

    _this.handleMove = function(startPosition, endPosition, playerId){
        if !(_isPlayerMove(playerId)){
            return false;
        }
        // Is there a character at startposition?
        activeCharacter = characterAtPosition(startPosition);
        if (activeCharacter == null){
            return false;
        }

        // Is that character controlled by playerID?
        if !(activeCharacter.getPlayerId() == playerID){
            return false;
        }

        // Is the endPosition empty?
        if !(charactersAtPosition(endPosition) == null){
            return false
        }

        // Can the activeCharacter move in that position?
        if !(endPosition in activeCharacter.getAccessibleCells()){
            return false;
        }

        activeCharacter.setPosition(endPosition);
        _numberOfMoves += 1;
        return true;
    };

    _this.handleTurn = function(position, newHeading, playerId){
        if !(_isPlayerMove(playerId)){
            return false;
        }

        // Is there a character at startposition?
        activeCharacter = characterAtPosition(startPosition);
        if (activeCharacter == null){
            return false;
        }

        // Is that character controlled by playerID?
        if !(activeCharacter.getPlayerId() == playerID){
            return false;
        }

        // Am I turning by a nonzero angle?
        if (newHeading ==  activeCharacter.getHeading()){
            return false;
        }

        activeCharacter.setHeading(newHeading);
        _numberOfMoves += 1;
        return true;
    };

    _this.handleAttack = function(attackerPosition, attackedPosition, playerId){
        if !(_isPlayerMove(playerId)){
            return false;
        }

        // Is there a character at startposition?
        activeCharacter = characterAtPosition(startPosition);
        if (activeCharacter == null){
            return false;
        }

        // Is that character controlled by playerID?
        if !(activeCharacter.getPlayerId() == playerID){
            return false;
        }

        isValid = activeCharacter.attack(attackedPosition, _this);
        _numberOfMoves += 1; 
        return isValid;
    };

    _this.handlePass  = function(playerId) {
        if !(_isPlayerMove(playerId)){
            return false;
        }
        // More spooky arithmetic for eric
        _numberOfMoves =  (Math.floor(_numberOfMoves / _movePerTurn) + 1) * _movePerTurn;
        return true;
    };
};