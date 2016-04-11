module.exports = function(startPosition, startHeading, playerId) {
	var _this = this;

	_this.playerId = playerId;
	_this.position = startPosition;
	_this.heading = startHeading;

	_this.characterType = "Character";
	_this.alive = true;

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
		return this._alive;
	}

	_this.attack = function(){
		return false;
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
   			"heading": _this.heading
		}
		return characterObject;
	}
};