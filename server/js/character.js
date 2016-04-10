module.exports = function(startPosition, startHeading, playerId) {
	var _this = this;

	_this.playerId = playerId;
	_this.position = startPosition;
	_this.heading = startHeading;

	_this.getPlayerId = function() {
		return _this.playerId;
	};

	_this.getPosition = function() {
		return _this.position;
	};

	this.setPosition = function(newPosition) {
		_thisposition = newPosition;
	};

	_this.getHeading = function(){
		return _this.heading;
	};

	_this.setHeading = function(heading){
		_this.heading = newHeading;
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

	_this.attack = function(){
		return false;
	};

	_this.defend = function(attackType, attackHeading){
		return false;
	}
};