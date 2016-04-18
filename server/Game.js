var vectorUtils = require('./utils/vectorUtils');
var Character = require('./js/character');
var Archer = require('./js/archer');
var Swordsman = require('./js/swordsman');
var Scout = require('./js/scout');
var Player = require('./js/player');

module.exports = function() {
	var _this = this;
    var _characters = [];
    var _gameObjects = [];
    var _boardSize = 7;
    var _maxTurnTime = 100;
    var _numberOfMoves = 0;     // Number of moves since the beginning of the game
    var _movePerTurn = 2;
    var _playersId = []

    var _roundNumber = 0; 

    // Spooky modular arithmetic for eric
    // Return 1 if this is player's 1 turn, 2 if this is player 2 turn
    _getActivePlayerId = function(){
        var turnNumber = Math.floor(_numberOfMoves / _movePerTurn);
         activePlayerIndex =  (turnNumber % 2 )
         activePlayerId = _playersId[activePlayerIndex].getID();
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

    //create the actual character objects based upon what json object somes in
    _createCharacter = function(character,charID){
        var characterColor = (_playersId.findIndex(x => x.getID()==character.playerId) == 1) ? "red" : "blue";
        var characterObject;
        switch(character.characterType){
            case "archer":
                characterObject = new Archer(character.position,character.heading,character.playerId,charID,characterColor);
                break;
            case "swordsman":
                characterObject = new Swordsman(character.position,character.heading,character.playerId,charID,characterColor);
                break;
            case "scout":
                characterObject = new Scout(character.position,character.heading,character.playerId,charID,characterColor);
                break;
            default:
                break;
        }
        return characterObject
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

    _getPlayerFromID = function(playerID){
        // console.log("trying to get player from id:", playerID);
        // console.log(_playersId);
        index = _playersId.findIndex(x => x.getID()==playerID);
        return _playersId[index];
    }

    _this.staticStart = function(){
        characterJSONArray = [];
        startCharacters = ["swordsman","archer","scout"];
        headingsArray = [{x:0,y:1},{x:0,y:-1}];
        positionsArray = [{x:0,y:0},{x:4,y:5},{x:2,y:0},{x:5,y:6},{x:6,y:6},{x:4,y:6}];
        for (i = 0; i < _playersId.length; i++){
            for (j = 0; j < startCharacters.length; j++){
                characterJSONArray.push({
                    "characterType":startCharacters[j],
                    "position":positionsArray[i * 3 + j],
                    "heading":headingsArray[i],
                    "playerId":_playersId[i].getID()
                });
            }
        }
        _this.insertCharacters(characterJSONArray);
    }

    // Public analog of functions above
    _this.addPlayer = function(playerId) {
        if (_playersId.length < 2){
            var player = new Player(playerId);
            _playersId.push(player);
            return true;
        };
        return false;
    };

    _this.joinable = function(){
        return _playersId.length == 1;
    }

    _this.getOtherPlayerId = function(playerId) {
        if (_this.canStart()){
            var thisIndex = _playersId.findIndex(x => x.getID()==playerId);
            var otherIndex = (thisIndex + 1 ) % 2;
            var otherPlayerId = _playersId[otherIndex].getID();
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

        // TODO: make it such that each player can insert their own characters, and there aren't duplicate inserts
        _characters = startCharacters.map(function(character){
            return this._createCharacter(character,startCharacters.indexOf(character));
        });

        // TODO: call initialize round at the correct time
        initializeRound();

    };

    //gets called at the beginning of each round
    //reset all round variables
    //reset player information
    initializeRound = function(){
        _roundNumber++;
        _numberOfMoves = 0;
        var player0Chars = _characters.filter(function(character){

            if (character.getPlayerId() == _playersId[0].getID()){
                return character
            }
        });

        var player1Chars = _characters.filter(function(character){
            if (character.getPlayerId() == _playersId[1].getID()){
                return character
            }
        });

        initPlayerArrays(_playersId[0],player0Chars,player1Chars);
        initPlayerArrays(_playersId[1],player1Chars,player0Chars);

    }

    initPlayerArrays = function(player,allies,enemies){
        player.initMyArray(allies);
        player.initEnemyArray(enemies);
    }

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
        activeCharacter = _getCharacterAtPosition(position);
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
        params = {
            "board-size":_boardSize,
            "available-characters":[] // need some way to find restrict available characters, or at least to provide them for the players' placements
        }
        // This function should return game parameters like available characters, board size, etc
    };

    //takes player ID and returns all enemy characters that lie within visibility of player's characters
    var charactersVisibleTo = function(playerID){
        if (playerID == "OBSERVER"){
            return _characters;
        }

        var friendlyChars = _characters.filter(function(character) {
            return character.getPlayerId() == playerID;
        });
        var cumulativeVisibility = [];
        for (i = 0; i < friendlyChars.length; i++){
            cumulativeVisibility = cumulativeVisibility.concat(friendlyChars[i].getVisibleCells());
        }

        var enemyChars = _characters.filter(function(character) {
            return character.getPlayerId() != playerID;
        });

        for (i = 0; i < enemyChars.length; i++){
            for (j = 0; j < cumulativeVisibility.length; j++){
                if (vectorUtils.isEqual(enemyChars[i].getPosition(), cumulativeVisibility[j])){
                    friendlyChars.push(enemyChars[i]);
                    _getPlayerFromID(playerID).seeEnemyCharacter(enemyChars[i]);
                    break;
                }
            }
        }
        return friendlyChars;
    }

    //returns game state object dependent upon who is requesting it
    //player id can correspond to player 1, 2, or an observer
    _this.serialize = function(playerID){

        var serializedChars = charactersVisibleTo(playerID).map(function(character) {
            return character.serialize();
        });

        console.log("player id in serialize is :", playerID);

        gameObj = {
            "message":"update-state",
            "turn":_this.getActivePlayerId(),
            "characters":serializedChars,
            "animations":[],
            "HUD":{
                "selfChars":_getPlayerFromID(playerID).getHUDInfoSelf(),
                "enemyChars":_getPlayerFromID(playerID).getHUDInfoEnemy(),
                "selfWins":_getPlayerFromID(playerID).getNumWins(),
                "enemyWins":((_roundNumber-1) - _getPlayerFromID(playerID).getNumWins())
            }
        }
        return gameObj;
    }
};
