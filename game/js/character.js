module.exports = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	_this.playerId = playerId;
	_this.position = startPosition;
	_this.heading = startHeading;
	_this.charID = charID; // charID identifies character for HUD rendering
	_this.charColor = startColor;

	_this.headingCost = 1;
	_this.movingCost = 1;
	_this.attackCost = 1;

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

	_this.setPosition = function(newPosition) {
		_this.position = newPosition;
		return this.movingCost;
	};

	_this.getHeading = function(){
		return _this.heading;
	};

	_this.setHeading = function(heading){
		_this.heading = heading;
		return _this.headingCost;
	};

	_this.getDynamicVisibility = function(){
		return  _this.getAliveness() ? _this.getVisibleCells() : [];
	}

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
	
	_this.getHeadingCost = function(){
		return _this.headingCost;
	}
	
	_this.getMovingCost = function(){
		return _this.movingCost;
	}
	
	_this.getAttackCost = function(){
		return _this.attackCost;
	}


	_this.kill = function(){
		console.log("death and despair");
		_this.alive = false;
	}

	//TODO: Implement for different characters
	//Returns an object with arbitrary fields
	//Used to display pertinent information in the character panel
	//Things like line of sight images, descriptions of attacks/defends, and bio go here
	//The fields are arbitrary, but should remain consistent for consistent things-
	////Some characters don't have clear attack range, so they won't have an attack range photo, etc.
	_this.getInfo = function(){
		return {
			"move": _this.movingCost,
			"turn": _this.headingCost,
			"attack": _this.attackCost
		};
	}

	//returns list of animations. If empty, there are no animations.
	_this.attack = function(){
		return {'attackCost':_this.attackCost, 'animationList':[]};
	};

	_this.defend = function(attackType, attackHeading){
		return {"successful":false};
	}

	_this.serialize = function(){
		var characterObject = {
			"type": _this.getCharacterType(),
			"team": _this.getPlayerId(),
			"position": _this.getPosition(),
    		"alive": _this.getAliveness(),
    		"visibility": _this.getDynamicVisibility(),
    		"attack": _this.getAttackableCells(),
   			"move": _this.getAccessibleCells(),
   			"heading": _this.heading,
   			"color": _this.charColor,
   			"costInfo": _this.getInfo()
		}
		return characterObject;
	}

	//This is for roster HUD purposes
	_this.infoSerialize = function(){
		var info = {
			"charType":_this.getCharacterType(),
			"movement":[],
			"visibility":[],
			"attack":[]
		}
		return info;
	}

};
