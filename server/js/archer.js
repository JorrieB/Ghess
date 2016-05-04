var Character = require('./character');
var utils = require('../utils/vectorUtils');

module.exports = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var arrowRange = 10;


	//Costs
	_this.headingCost = 1;
	_this.movingCost = 1;
	_this.attackCost = 1;

	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);
	_this.characterType = "Archer";


	_this.getVisibleCells = function(){
		return [_this.getPosition(),utils.vectorSum(_this.getPosition(), _this.getHeading())];
	};

	_this.getAttackableCells = function(){
		attackableCells = [];
		for (var i = 0; i <= arrowRange; i++) {
			attackableCells.push(utils.vectorSum(utils.vectorMultScalar(_this.heading, i),_this.position));
		}
		return attackableCells
	};

	_this.getAccessibleCells = function(){
		return [utils.vectorSum(_this.position, _this.heading)];
	};

	_this.attack = function(attackedPosition, game){
		var animationList = []
		for (i = 1; i <= arrowRange; i++){
			//get square arrow is currently in based on how far the arrow has flown and where the character is
			var attackTile = utils.vectorSum(utils.vectorMultScalar(_this.heading, i),_this.position);

			//if the arrow has left the board, end the flight of the arrow
			if (!game.tileOnBoard(attackTile)){
				break;
			}

			attackedPosition = attackTile;

			//check if a character is in the current attacked square
			var attackedCharacter = game.getCharacterAtPosition(attackTile);

			// If there is no character, skip to next cell
			if (attackedCharacter == null){ continue }

			// If the character is dead, skip to next cell
			if (!(attackedCharacter.getAliveness())){ continue}

			var attack = {
					"isValid":true,
					"attack":"arrow",
					"startPos":_this.getPosition(),
					"endPos":attackedPosition
				};
			animationList.push(attack);

			//char in square may be able to defend itself
			var defend = attackedCharacter.defend('arrow', _this.heading);
			//if not, kill the character
			if (!defend.successful){
				game.destroyCharacter(attackedCharacter);
			} else {
				animationList.push(defend);
			}
			return {'attackCost':_this.attackCost, 'animationList':animationList};
		}

		var animationList =  [{
					"isValid":true,
					"attack":"arrow",
					"startPos":_this.getPosition(),
					"endPos":attackedPosition
				}];

		return {'attackCost':_this.attackCost, 'animationList':animationList};

	}
};
