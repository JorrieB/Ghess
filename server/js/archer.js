var Archer = function(startPosition, startHeading, playerId) {
	var _this = this;
	var arrowRange = 10;
 
	Character.call(_this, startPosition, startHeading, playerId);

	_this.getPosition = function() {
		return _position;
	};

	_this.getHeading = function(){
		return _heading;
	};

	_this.getVisibleCells = function(){
		return [{x:0, y:0}];		
	};

	_this.getAttackableCells = function(){
		attackableCells = [];
		for (var i = 0; i <= arrowRange; i++) {
			attackableCells.push(startHeading * i);
		}
		return attackableCells
	};

	_this.getAccessibleCells = function(){
		return [_heading];
	};
};