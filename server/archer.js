var Archer = function(startPosition, startHeading) {
	var _this = this;
	var arrowRange = 10;
 
	Character.call(_this, startPosition, startHeading);

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
		attackableCells = []
		//TODO discuss format for attack 
	};

	_this.getAccessibleCells = function(){
		return [[_heading]];
	};
};