var vectorUtils = require('../utils/vectorUtils');
var Character = require('./character');

module.exports = function(startPosition, startHeading, playerId) {
	var _this = this;
 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading,  playerId);

	_this.getVisibleCells = function(){
		var right = turnRight(_this.heading);
		var left = turnLeft(_this.heading);
		visibleCells = [_this.position + _this.heading, 
						_this.position + _this.heading + right,
						_this.position +  _this.heading + left];
		return visibleCells;
	};

	_this.getAttackableCells = function(){
		return [vectorUtils.vectorSum(_this.position, _this.heading)];
	};

	_this.getAccessibleCells = function(){
		return [vectorUtils.vectorSum(_this.position, _this.heading)];
	};

	_this.attack = function(attackedPosition, game){
		// Is the endPosition occupied?
        targetCharacter = (game.getCharacterAtPosition(attackedPosition));
        if (targetCharacter == null){
            return false;
        }

        // Is the targetCharacter an adversary?
        if (targetCharacter.getPlayerId() == playerId){
            return false;
        }

        // Can the knight attack in that position?
        if (! vectorUtils.inVectorList(activeCharacter.getAttackableCells(), attackedPosition)){
            return false;
        }

        // If all of the condition are satisfied, destroy the targerCharacter
        game.destroyCharacter(targetCharacter);
        return true;
	}
};