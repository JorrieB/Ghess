var vectorUtils = require('./utils/vectorUtils');


module.exports = function() {
	var _this = this;
    var _characters = [];
    var _gameObjects = [];
    var _boardSize = 7;
    var _maxTurnTime = 100;
    var _numberOfMoves = 0;     // Number of moves since the beginning of the game
    var _movePerTurn = 2;
    var _playersId = []

    // Spooky modular arithmetic for eric
    // Return 1 if this is player's 1 turn, 2 if this is player 2 turn
    _getActivePlayerId = function(){
        var turnNumber = Math.floor(_numberOfMoves / _movePerTurn);
         activePlayerIndex =  (turnNumber % 2 )
         activePlayerId = _playersId[activePlayerIndex];
         return activePlayerId;
    }

   _isPlayerMove = function(playerId){
        return (playerId == _getActivePlayerId())
    }

    // Return null if there are no characters, return the first character if there are more than 1 character
    _getCharacterAtPosition = function(position){
        characterAtPosition = null;
        charactersAtPosition = [];

        for (characterIndex in _characters){
            character = _characters[characterIndex];
            if (vectorUtils.isEqual(character.getPosition(), position)){
                charactersAtPosition.push(character);
            }
        }

        switch(charactersAtPosition.length) {
        case 0:
            console.log("Warning: There are no characters at this position");
            break;
        case 1:
            characterAtPosition = charactersAtPosition[0];
            break;
        default:
            // Weird case in wich there are more than one characters in one position 
            console.log("Warning: There are multiple character in this position")
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
    _this.addPlayer = function(playerId) {
        // TODO
        // This should store the given player id in the game
        if (_playersId.length < 2){
            _playersId.push(playerId);
            return true;
        };
        return false;
    };

    _this.getOtherPlayerId = function(playerId) {
        if (_this.canStart()){
            var thisIndex = _playersId.indexOf(playerId);
            var otherIndex = (thisIndex + 1 ) % 2;
            var otherPlayerId = _playersId[thisIndex];
            return otherPlayerId;
        }
        return null;
    };

    _this.canStart = function() {
        return (_playersId.length == 2);
    }

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
    };

    _this.getCharacters = function(){
        return _characters;
    };

    _this.destroyCharacter = function(character){
        return _destroyCharacter(character);
    }

    _this.tileOnBoard = function(position) {
        return position.x >= 0 && position.x < _boardSize && position.y >= 0 && position.y < _boardSize;
    }
    //Handler for the moves that change the game state:

    _this.handleMove = function(startPosition, endPosition, playerId){
        if (!_isPlayerMove(playerId)){
            return false;
        }
        // Is there a character at startposition?
        activeCharacter = _getCharacterAtPosition(startPosition);
        if (activeCharacter == null){
            return false;
        }

        // Is that character controlled by playerID?
        if (!activeCharacter.getPlayerId() == playerId){
            return false;
        }

        // Is the endPosition empty?
        if (!(_getCharacterAtPosition(endPosition) == null)){
            return false
        }

        // Can the activeCharacter move in that position?
        if (! vectorUtils.inVectorList(activeCharacter.getAccessibleCells(), endPosition)){
            return false;
        }

        activeCharacter.setPosition(endPosition);
        _numberOfMoves += 1;
        return true;
    };

    _this.handleTurn = function(position, newHeading, playerId){
        if (!_isPlayerMove(playerId)){
            return false;
        }

        // Is there a character at startposition?
        activeCharacter = _getCharacterAtPosition(startPosition);
        if (activeCharacter == null){
            return false;
        }

        // Is that character controlled by playerID?
        if (!activeCharacter.getPlayerId() == playerId){
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
        if (!_isPlayerMove(playerId)){
            return false;
        }

        // Is there a character at startposition?
        activeCharacter = _getCharacterAtPosition(attackerPosition);
        if (activeCharacter == null){
            return false;
        }

        // Is that character controlled by playerID?
        if (!(activeCharacter.getPlayerId() == playerId)){
            return false;
        }
        isValid = activeCharacter.attack(attackedPosition, _this);
        _numberOfMoves += 1; 
        return isValid;
    };

    _this.handlePass  = function(playerId) {
        if (!_isPlayerMove(playerId)){
            return false;
        }
        // More spooky arithmetic for eric
        _numberOfMoves =  (Math.floor(_numberOfMoves / _movePerTurn) + 1) * _movePerTurn;
        return true;
    };

    _this.getParams = function() {
        // TODO
        // This function should return game parameters like available characters, board size, etc
    };

    //takes player ID and returns all enemy characters that lie within visibility of player's characters
    var charactersVisibleTo = function(playerID){
        //filter character array on player id
        //find union of visibility of player's characters
        //find all characters visible to players characters
    }

    //returns game state object dependent upon who is requesting it
    //player id can correspond to player 1, 2, or an observer
    _this.serialize = function(playerID){
        //if (player id is observer){send full character array}
        //else {
            //characters = enemiesVisible
        //}

        gameObj = {
            "message":"update-state",
            "turn":getActivePlayerId(),
            "characters":_characters,
            "animations":[]
        }
        return gameObj;
    }
};
