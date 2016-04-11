var Character = require('./character');
var vectorUtils = require('../utils/vectorUtils');

module.exports  = function(startPosition, startHeading, playerId) {
	var _this = this;
	var scoutRange = 2;

 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading, playerId);
	_this.characterType = "Scout";
<<<<<<< HEAD
=======

>>>>>>> 0785c6908fec1a87002b6ca75ea50cff761f1ade

	_this.getVisibleCells = function(){
		visibleCells = []
		for (var i = 0; i <= scoutRange; i++) {
			for (var j = 0; j <= scoutRange; j ++){
				visibleCells.push({x:i, y:j});
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