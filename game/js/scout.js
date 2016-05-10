var Character = require('./character');
var vectorUtils = require('../utils/vectorUtils');

module.exports  = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var scoutRange = 2;
	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);

	//Costs
	_this.headingCost = 0;
	_this.movingCost = 2;
	_this.attackCost = 11;

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
		return [];
	};

	_this.getAccessibleCells = function(){
		return [vectorUtils.vectorSum(_this.position, _this.heading)];
	};
};
