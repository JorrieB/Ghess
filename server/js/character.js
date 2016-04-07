var Character = function(startPosition, startHeading) {
	var _this = this;

	var _position = startPosition;
	var _heading = heading;

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
		return [];
	};

	_this.getAccessibleCells = function(){
		return [];
	};
};

console.log("FUCK YOU")