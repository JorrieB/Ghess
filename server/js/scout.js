var Character = require('./character');
var vectorUtils = require('../utils/vectorUtils');

module.exports  = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var scoutRange = 2;

 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);
	_this.characterType = "Scout";


	_this.getVisibleCells = function(){
		visibleCells = []
		for (var i = -scoutRange; i <= scoutRange; i++) {
			for (var j = -scoutRange; j <= scoutRange; j++){
				//restrict visibility to mostly directly in front
				//TODO: introduce directionality - right now, it doesn't take scout turning into play
				if ((i+j) > -2 && (i+j) <= 2){
					visibleCells.push(vectorUtils.vectorSum({x:i, y:j}, _this.getPosition()));
				}
				
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