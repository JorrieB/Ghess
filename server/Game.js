var vectorUtils = require('./utils/vectorUtils');
var Character = require('./js/character');
var Archer = require('./js/archer');
var Swordsman = require('./js/swordsman');
var Scout = require('./js/scout');
var Player = require('./js/player');

module.exports = function() {

    var numCharsForEachPlayer = 3;

	var _this = this;
    var _characters = [];
    var _gameObjects = [];
    var _boardSize = 7;
    var _maxTurnTime = 100;
    var _numberOfMoves = 0;     // Number of moves since the beginning of the game
    var _movePerTurn = 2;
    var _playersId = []

    var _animations = [];

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
            var aliveIndex = charactersAtPosition.findIndex(x => x.getAliveness());
            characterAtPosition = charactersAtPosition[aliveIndex];
            break;
        default:
            // Weird case in wich there are more than one characters in one position
            console.log("Warning: There are multiple character in this position")
            var aliveIndex = charactersAtPosition.findIndex(x => x.getAliveness());
            characterAtPosition = charactersAtPosition[aliveIndex];
        }
        return characterAtPosition;
    }

    _playerNumber = function(playerID){
        return _playersId.findIndex(x => x.getID()==playerID);
    }

    _playerColor = function(playerID){
        return (_playersId.findIndex(x => x.getID()==playerID) == 1) ? "red" : "blue";
    }

    //create the actual character objects based upon what json object somes in
    _createCharacter = function(character,charID){
        var characterColor = _playerColor(character.playerId);
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

        // If the character is already dead return false, something bad is happening
        if (!(character.getAliveness())){
            console.log("You are trying to kill the deads. Fix your bugs son.")
            return false;
        }
        character.kill();
        return true;
    }

    _getPlayerFromID = function(playerID){
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
        return characterJSONArray
        _this.insertCharacters(characterJSONArray);
    }

    // Public analog of functions above
    _this.addPlayer = function(playerId) {
        console.log('adding player');
        if (_playersId.length < 2 && (_playersId.findIndex(x => x.getID() == playerId) == -1)){
            console.log("and we got here");
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
        if (_playersId.length == 2){
            return (_playersId[0].readyToStart() && _playersId[1].readyToStart());
        }
        return false
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

    _this.insertCharacters = function(startCharacters, playerID){
        // For now, we just statically insert a list of characters

        // TODO: make it such that each player can insert their own characters, and there aren't duplicate inserts
        characters = startCharacters.map(function(character){
            return this._createCharacter(character,startCharacters.indexOf(character));
        });

        _getPlayerFromID(playerID).initMyArray(characters);

        //if both players are in the game
        if (_this.canStart()){
            //and they have both selected characters
            if (_playersId[0].readyToStart() && _playersId[1].readyToStart()){
                initializeRound(_playersId[0],_playersId[1]); //then start the round
            }
        }

    };

    //gets called at the beginning of each round
    //reset all round variables
    //reset player information
    initializeRound = function(player1,player2){
        _roundNumber++;
        _numberOfMoves = 0;

        player1.initEnemyArray(player2.getMyArray());
        player2.initEnemyArray(player1.getMyArray());

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
        characterAtEndPosition =  _getCharacterAtPosition(endPosition);
        if (!(characterAtEndPosition == null)){
            // Is the character dead? NOT PROUD OF THIS
             if (characterAtEndPosition.getAliveness()){
                return false;
            }
        }

        // Can the activeCharacter move in that position?
        if (! vectorUtils.inVectorList(activeCharacter.getAccessibleCells(), endPosition)){
            return false;
        }

        activeCharacter.setPosition(endPosition);
        _animations = [];
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
        _animations = [];
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
        attack = activeCharacter.attack(attackedPosition, _this);
        _animations = [attack]; //add the attack animation information
        _numberOfMoves += 1;
        return attack.isValid;
    };

    _this.handlePass  = function(playerId) {
        if (!_isPlayerMove(playerId)){
            return false;
        }
        // More spooky arithmetic for eric
        _numberOfMoves =  (Math.floor(_numberOfMoves / _movePerTurn) + 1) * _movePerTurn;
        _animations = [];
        return true;
    };



    _this.getParams = function(playerID) {
        params = {
            "board-size":_boardSize,
            "roster":["archer","swordsman","scout", "archer","swordsman","scout"], // need some way to find restrict available characters, or at least to provide them for the players' placements
            "color": _playerColor(playerID),
            "playerNumber":_playerNumber(playerID),
            "numChars":numCharsForEachPlayer
        }
        return params;
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
            cumulativeVisibility = cumulativeVisibility.concat(friendlyChars[i].getDynamicVisibility());
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

        gameObj = {
            "message":"update-state",
            "turn":_this.getActivePlayerId(),
            "characters":serializedChars,
            "animations":_animations,
            "HUD":{
                "selfChars":_getPlayerFromID(playerID).getHUDInfoSelf(),
                "enemyChars":_getPlayerFromID(playerID).getHUDInfoEnemy(),
                "selfWins":_getPlayerFromID(playerID).getNumWins(),
                "enemyWins":((_roundNumber-1) - _getPlayerFromID(playerID).getNumWins())
            }
        }
        return gameObj;
    }

    //TEAM-SELECTION
    //returns an array of character objects used during roster selection
    _this.getRoster = function(){
        return ["archer","swordsman","scout"];
    }

    //property of the game
    //defines how many characters each player gets to have
    //TODO: make this number customizable when creating a game
    _this.getNumChars = function(){
        return numCharsForEachPlayer;
    }
};
