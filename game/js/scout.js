var Character = require('./character');
var vectorUtils = require('../utils/vectorUtils');

module.exports  = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var scoutRange = 2;

	//Costs
	_this.headingCost = 1;
	_this.movingCost = 1;
	_this.attackCost = 1;

 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);
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

	_this.getAttackableCells = function(){
		return [];
	};

	_this.getAccessibleCells = function(){
		return [vectorUtils.vectorSum(_this.position, _this.heading)];
	};
};