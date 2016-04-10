var Knight = function(startPosition, startHeading, playerId) {
	var _this = this;
 	//The size of the square centerd at the scout is scoutRange + 1

	Character.call(_this, startPosition, startHeading,  playerId);

	_this.getVisibleCells = function(){
		var _right = turnRight(_heading);
		var _left = turnLeft(_heading);
		visibleCells = [_heading, _heading + _right, _heading + _left];
		return visibleCells;
	};

	_this.getAttackableCells = function(){
		return [_heading];
	};

	_this.getAccessibleCells = function(){
		return [_heading];
	};

	_this.attack = function(attackedPosition, game){
		// Is the endPosition occupied?
        targetCharacter = (game.charactersAtPosition(endPosition);
        if (targetCharacter == null){
            return false;
        }

        // Is the targetCharacter an adversary?
        if (targetCharacter.getPlayerId() == _playerID){
            return false;
        }

        // Can the knight attack in that position?
        if !(endPosition in activeCharacter.getAttackableCells()){
            return false;
        }

        // If all of the condition are satisfied, destroy the targerCharacter
        game.destroyCharacter(targerCharacter);
        return true;
	}
};