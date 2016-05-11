var Character = require('./character');
var vectorUtils = require('../utils/vectorUtils');

module.exports  = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var scoutRange = 2;
	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);

	//Costs
	_this.headingCost = 0;
	_this.movingCost = 2;
	_this.attackCost = 5;

 	//The size of the square centerd at the scout is scoutRange + 1

	_this.characterType = "Scout";


	// TODO: fix visibility of scout
	_this.getVisibleCells = function(){
		visibleCells = []
		for (var i = -scoutRange; i <= scoutRange; i++) {
			for (var j = -scoutRange; j <= scoutRange; j++){
				visibleCells.push(vectorUtils.vectorSum({x:i, y:j}, _this.getPosition()));
				
			}
		}
		return visibleCells;
	};
	
	_this.originalGetVisibleCells = function(){
		visibleCells = []
		for (var i = -scoutRange; i <= scoutRange; i++) {
			for (var j = -scoutRange; j <= scoutRange; j++){
				visibleCells.push(vectorUtils.vectorSum({x:i, y:j}, _this.getPosition()));
				
			}
		}
		return visibleCells;
	};

	_this.getAttackableCells = function(){
		attackableCell = vectorUtils.vectorSum(_this.position, _this.heading);
		return [attackableCell];
	};

	_this.getAccessibleCells = function(){
		return [vectorUtils.vectorSum(_this.position, _this.heading)];
	};

	_this.attack = function(attackedPosition, game){
		// Is the endPosition occupied?
	        targetCharacter = (game.getCharacterAtPosition(attackedPosition));

        	var animationList = [];

        if (targetCharacter == null){
        	return {'attackCost':0, 'animationList':animationList};
        	}
       		// Is the targetCharacter dead
       		if (!(targetCharacter.getAliveness())){
        		return {'attackCost':0, 'animationList':animationList};
       		}

        	// Is the targetCharacter an adversary?
        	if (targetCharacter.getPlayerId() == playerId){
        		return {'attackCost':0, 'animationList':animationList};
        	}

        	// Can the scout attack in that position?
        	if (! vectorUtils.inVectorList(activeCharacter.getAttackableCells(), attackedPosition)){
        		return {'attackCost':0, 'animationList':animationList};
        	}

        	// If all of the condition are satisfied, destroy the targerCharacter
        	game.destroyCharacter(targetCharacter);
        	var swordAttack = {
			"isValid":true,
			"attack":"sword",
			"startPos":_this.getPosition(),
			"endPos":attackedPosition
		};
		animationList.push(swordAttack);

        	return {'attackCost':_this.attackCost, 'animationList':animationList}
	}

};
