var Character = function(startPosition, startHeading, playerId) {
	var _this = this;

	var _playerId = _playerId;
	var _position = startPosition;
	var _heading = heading;

	_this.getPlayerId = function() {
		return _playerId;
	};

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