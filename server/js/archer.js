var Character = require('./character');

module.exports = function(startPosition, startHeading, playerId) {
	var _this = this;
	var arrowRange = 10;
 
	Character.call(_this, startPosition, startHeading, playerId);

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

	_this.attack = function(attackedPosition, game){
		// TODO
		// characters = game.getCharacters();
		// charactersInLine = characters.filter(
		// 	function(character){
		// 		return 
		// 	})
		return false;
	}
};