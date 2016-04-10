var Character = require('./character');
var utils = require('../utils/vectorUtils.js')

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
		return [vectorUtils.vectorSum(_this.position, _this.heading)];
	};

	_this.attack = function(attackedPosition, game){
		for (i = 1; i <= arrowRange; i++){
			//get square arrow is currently in based on how far the arrow has flown and where the character is
			var attackTile = utils.vectorSum(utils.vectorMultScalar(_this.heading, i),_this.position);

			//if the arrow has left the board, end the flight of the arrow
			if (!game.tileOnBoard(attackTile)){
				break;
			}

			//check if a character is in the current attacked square
			var attackedCharacter = game.getCharacterAtPosition(attackTile);
			if (attackedCharacter != null){
				//char in square may be able to defend itself
				var successfulDefend = attackedCharacter.defend('arrow', _this.heading);
				//if not, kill the character
				if (!successfulDefend){
					game.destroyCharacter(attackedCharacter);
				}
				break;
			}
		}

		return true;

	}
};