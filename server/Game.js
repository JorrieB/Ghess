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
    var _players = [];
    var _observers = []; // Remember our observers so we can emit messages to them

    var _animations = [];

    var _roundNumber = 0;

    // Spooky modular arithmetic for eric
    // Return 1 if this is player's 1 turn, 2 if this is player 2 turn
    _getActivePlayer = function(){
        var turnNumber = Math.floor(_numberOfMoves / _movePerTurn);
         activePlayerIndex =  (turnNumber % 2 )
         if (activePlayerIndex != -1) {
            activePlayer = _players[activePlayerIndex];
         }
         return activePlayer;
    }

    // Returns an array of positions where the player is allowed to place their characters from the beginning of the game
    // [{x:int,y:int}]
    _getPlaceableSquares = function(playerID){
        squares = [];
        var player = _playerNumber(playerID);
        var baseY = player * (1 + (_boardSize/2 | 0));
        for (x = 0; x < _boardSize; x++){
            for (y = baseY; y < baseY + (_boardSize/2 | 0); y++){
                squares.push({'x':x,'y':y});
            }
        }
        return squares;
    }

   _isPlayerMove = function(playerID){
        return (playerID == _getActivePlayer().getID());
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

    // Returns the index of the player in the player array (either 0 or 1)
    _playerNumber = function(playerID){
        return _players.findIndex(x => x.getID()==playerID);
    }

    _playerColor = function(playerID){
        return (_playerNumber(playerID) == 1) ? "red" : "blue";
    }

    //create the actual character objects based upon what json object somes in
    _createCharacter = function(character,charID,playerID){
        var characterColor = _playerColor(playerID);
        var characterObject;
        switch(character.type){
            case "archer":
                characterObject = new Archer(character.position,character.heading,playerID,charID,characterColor);
                break;
            case "swordsman":
                characterObject = new Swordsman(character.position,character.heading,playerID,charID,characterColor);
                break;
            case "scout":
                characterObject = new Scout(character.position,character.heading,playerID,charID,characterColor);
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

        _getPlayerFromID(character.getPlayerId()).allyDied(character);

        return true;
    }

    _getPlayerFromID = function(playerID){
        index = _players.findIndex(x => x.getID()==playerID);
        return _players[index];
    }

    // Is the game over? for now draw not allowed
    _this.isGameOver = function(){
        for (i = 0; i < _players.length; i++){
            playerId = _players[i].getID();
            //Find the characters that are still alive for current playerId
            var playerAliveCharacters = _characters.filter(function(character){
                if (playerId == character.getPlayerId() && character.getAliveness()){
                    return character; }})
            // If there are no characters left for this player, the other player won.
            if (playerAliveCharacters.length == 0){
                    return _this.getOtherPlayerId(playerId);
            }
        }
        return false;
    }

    _this.staticStart = function(){
        characterJSONArray = [];
        startCharacters = ["swordsman","archer","scout"];
        headingsArray = [{x:0,y:1},{x:0,y:-1}];
        positionsArray = [{x:0,y:0},{x:4,y:5},{x:2,y:0},{x:5,y:6},{x:6,y:6},{x:4,y:6}];
        for (i = 0; i < _players.length; i++){
            for (j = 0; j < startCharacters.length; j++){
                characterJSONArray.push({
                    "characterType":startCharacters[j],
                    "position":positionsArray[i * 3 + j],
                    "heading":headingsArray[i],
                    "playerId":_players[i].getID()
                });
            }
        }
        return characterJSONArray
        _this.insertCharacters(characterJSONArray);
    }

    // Public analog of functions above
    _this.addPlayer = function(playerId) {
        if (_players.length < 2 && (_players.findIndex(x => x.getID() == playerId) == -1)){
            var player = new Player(playerId);
            _players.push(player);
            return true;
        };
        return false;
    };

    _this.joinable = function(){
        return _players.length == 1;
    }

    _this.observable = function(){
        return _players.length == 2;
    }

    _this.addObserver = function(observerID){
        if (_observers.indexOf(observerID) == -1){
            _observers.push(observerID);
        }
    }

    _this.getObservers = function(){
        return _observers;
    }

    _this.getOtherPlayerId = function(playerId) {
        if (_this.canStart()){
            var thisIndex = _players.findIndex(x => x.getID()==playerId);
            var otherIndex = (thisIndex + 1 ) % 2;
            var otherPlayerId = _players[otherIndex].getID();
            return otherPlayerId;
        }
        return null;
    };

    _this.canStart = function() {
        if (_players.length == 2){
            return (_players[0].readyToStart() && _players[1].readyToStart());
        }
        return false
    }

    _this.getActivePlayerId = function(){
        return _getActivePlayer();
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

        var characters = startCharacters.map(function(character){
            var charObject = this._createCharacter(character,startCharacters.indexOf(character),playerID);
            _characters.push(charObject);
            return charObject;
        });

        _getPlayerFromID(playerID).initMyArray(characters);

        //if both players are in the game
        if (_this.canStart()){
            //and they have both selected characters
            if (_players[0].readyToStart() && _players[1].readyToStart()){
                initializeRound(_players[0],_players[1]); //then start the round
            }
        }

    };

    //gets called at the beginning of each round
    //reset all round variables
    //reset player information
    initializeRound = function(player1,player2){
        _roundNumber++;
        _numberOfMoves = 0;

        var player1Characters = _characters.filter(function(character){
            if (player1.getID() == character.getPlayerId()){
                return character;
            }
        });
        var player2Characters = _characters.filter(function(character){
            if (player2.getID() == character.getPlayerId()){
                return character;
            }
        });

        player1.initEnemyArray(player2Characters);
        player2.initEnemyArray(player1Characters);
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

        movingCost = activeCharacter.setPosition(endPosition);
        _animations = [];
        _numberOfMoves += movingCost;
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

        headingCost = activeCharacter.setHeading(newHeading);
        _animations = [];
        _numberOfMoves += headingCost;
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
        attackOutput = activeCharacter.attack(attackedPosition, _this);
        animationsFromAttack = attackOutput.animationList;

        if (animationsFromAttack.length == 0){
            return false;
        }
        
        _animations = animationsFromAttack; //add the attack animation information
        _numberOfMoves += attackOutput.attackCost;
        return true;
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
            "validSquares":_getPlaceableSquares(playerID),
            "numChars":numCharsForEachPlayer
        }
        return params;
    };

    _isObserver = function(playerID){
        return _observers.indexOf(playerID) != -1;
    }

    //takes player ID and returns all enemy characters that lie within visibility of player's characters
    var charactersVisibleTo = function(playerID){
        if (_isObserver(playerID)){
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

        if (_isObserver(playerID)){
            return gameObj = {
            "message":"update-state",
            "stamina":(_movePerTurn - (_numberOfMoves % _movePerTurn)),
            "turn":_this.getActivePlayerId(),
            "characters":serializedChars,
            "animations":_animations,
            "HUD":{
                "selfChars":_players[0].getHUDInfoSelf(),
                "enemyChars":_players[1].getHUDInfoSelf(),
                "selfWins":0,
                "enemyWins":0
                }
            }
        }

        gameObj = {
            "message":"update-state",
            "stamina":(_movePerTurn - (_numberOfMoves % _movePerTurn)),
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
