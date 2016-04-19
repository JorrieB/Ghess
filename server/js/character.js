module.exports = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	_this.playerId = playerId;
	_this.position = startPosition;
	_this.heading = startHeading;
	_this.charID = charID; // charID identifies character for HUD rendering
	_this.charColor = startColor;

	_this.characterType = "Character";
	_this.alive = true;

	_this.getColor = function() {
		return startColor;
	}

	_this.getPlayerId = function() {
		return _this.playerId;
	};

	_this.getPosition = function() {
		return _this.position;
	};

	this.setPosition = function(newPosition) {
		_this.position = newPosition;
	};

	_this.getHeading = function(){
		return _this.heading;
	};

	_this.setHeading = function(heading){
		_this.heading = heading;
	};

	_this.getVisibleCells = function(){
		return [{x:0, y:0}];
	};

	_this.getAttackableCells = function(){
		return [];
	};

	_this.getAccessibleCells = function(){
		return [];
	};

	_this.getCharacterType = function(){
		return _this.characterType;
	}

	_this.getAliveness = function(){
		return this.alive;
	}

	//TODO: Implement for different characters
	//Returns an object with arbitrary fields
	//Used to display pertinent information in the character panel
	//Things like line of sight images, descriptions of attacks/defends, and bio go here
	//The fields are arbitrary, but should remain consistent for consistent things-
	////Some characters don't have clear attack range, so they won't have an attack range photo, etc.
	_this.getInfo = function(){
		return {};
	}

	//attack should return its animation information
	_this.attack = function(){
		return {
			"isValid":false,
			"attack":"undefined",
			"startPos":{x:0,y:0},
			"endPos":{x:0,y:0}
		};
	};

	_this.defend = function(attackType, attackHeading){
		return false;
	}

	_this.serialize = function(){
		var characterObject = {
			"type": _this.getCharacterType(),
			"team": _this.getPlayerId(),
			"position": _this.getPosition(),
    		"alive": _this.getAliveness(),
    		"visibility": _this.getVisibleCells(),
    		"attack": _this.getAttackableCells(),
   			"move": _this.getAccessibleCells(),
   			"heading": _this.heading,
   			"color": _this.charColor,
   			"info": _this.getInfo()
		}
		return characterObject;
	}
};
