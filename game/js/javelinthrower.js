var Character = require('./character');
var utils = require('../utils/vectorUtils');

module.exports = function(startPosition, startHeading, playerId, charID, startColor) {
	var _this = this;
	var javelinRange = 10;


	//Costs
	_this.headingCost = 1;
	_this.movingCost = 1;
	_this.attackCost = 1;

	Character.call(_this, startPosition, startHeading, playerId, charID, startColor);
	_this.characterType = "Javelinthrower";


	_this.getVisibleCells = function(){
		return [_this.getPosition(),utils.vectorSum(_this.getPosition(), _this.getHeading())];
	};

	_this.getAttackableCells = function(){
		attackableCells = [];
		frontTarget = utils.vectorSum(utils.vectorMultScalar(_this.heading, i),_this.position);

		for (var i = 0; i <= arrowRange; i++) {
			attackableCells.push(frontTarget);
			for (var j = 0; j <= i; j++) {
				attackableCells.push(utils.vectorSum(utils.vectorMultScalar(utils.turnRight(_this.heading), j), frontTarget));
				attackableCells.push(utils.vectorSum(utils.vectorMultScalar(utils.turnRight(_this.heading), j), frontTarget));
			}
		}
		return attackableCells
	};

	_this.getAccessibleCells = function(){
		return [utils.vectorSum(_this.position, _this.heading)];
	};

	_this.attack = function(attackedPosition, game){

        // Is the targetCharacter an adversary?
        if (targetCharacter.getPlayerId() == playerId){
        return {'attackCost':0, 'animationList':animationList};
        }

        // Can the swordsman attack in that position?
        if (! vectorUtils.inVectorList(activeCharacter.getAttackableCells(), attackedPosition)){
        return {'attackCost':0, 'animationList':animationList};
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
