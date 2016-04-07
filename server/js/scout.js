var Scout = function(startPosition, startHeading) {
	var _this = this;
	var scoutRange = 2;
 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading);

	_this.getPosition = function() {
		return _position;
	};

	_this.getHeading = function(){
		return _heading;
	};

	_this.getVisibleCells = function(){
		visibleCells = []
		for (var i = 0; i <= scoutRange; i++) {
			for (var j = 0; j <= scoutRange, j ++){
				visibleCells.push({x:i, y:j});
			}
		}
		return visibleCells;
	};

	_this.getAttackableCells = function(){
		return [];
	};

	_this.getAccessibleCells = function(){
		return [_heading];
	};
};