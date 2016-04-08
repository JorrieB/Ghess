var Knight = function(startPosition, startHeading, playerId) {
	var _this = this;
 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading,  playerId);

	_this.getPosition = function() {
		return _position;
	};

	_this.getHeading = function(){
		return _heading;
	};

	_this.getVisibleCells = function(){
		var _right = turnRight(_heading);
		var _left = turnLeft(_heading);
		visibleCells = [_heading, _heading + _right, _heading + _left];
		return visibleCells;
	};

	_this.getAttackableCells = function(){
		return [_heading];
	};

	_this.getAccessibleCells = function(){
		return [_heading];
	};
};