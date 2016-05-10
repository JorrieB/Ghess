var Character = require('./character');
var utils = require('../utils/vectorUtils');

module.exports = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var javelinRange = 10;
	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);


	//Costs
	_this.headingCost = 2;
	_this.movingCost = 2;
	_this.attackCost = 4;

		_this.characterType = "Javelinthrower";


	_this.getVisibleCells = function(){
		return [_this.getPosition(),utils.vectorSum(_this.getPosition(), _this.getHeading())];
	};

	_this.getAttackableCells = function(){
		attackableCells = [];
		for (var i = 0; i <= javelinRange; i++) {
			frontTarget = utils.vectorSum(utils.vectorMultScalar(_this.heading, i),_this.position);
			attackableCells.push(utils.vectorSum(utils.vectorMultScalar(utils.turnRight(_this.heading), i), frontTarget));
			attackableCells.push(utils.vectorSum(utils.vectorMultScalar(utils.turnLeft(_this.heading), i), frontTarget));
		}
		return attackableCells
	};

	_this.getAccessibleCells = function(){
		return [utils.vectorSum(_this.position, _this.heading)];
	};

	_this.attack = function(attackedPosition, game){

  // This should not be commented out, but it's broken and client side should be taking care of it
  //       // Can the javelinthrower attack in that position?
  //       if (! vectorUtils.inVectorList(_this.getAttackableCells(), attackedPosition)) {
  //       return {'attackCost':0, 'animationList':animationList};
  //       }


        targetCharacter = (game.getCharacterAtPosition(attackedPosition));

        if (! (targetCharacter == null)){
        	game.destroyCharacter(targetCharacter);
        }

		var animationList =  [{
					"isValid":true,
					"attack":"javelin",
					"startPos":_this.getPosition(),
					"endPos":attackedPosition
				}];


		return {'attackCost':_this.attackCost, 'animationList':animationList};

	}
};
