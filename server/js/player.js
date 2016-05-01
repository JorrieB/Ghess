module.exports = function(ID) {
	var _this = this;

	var playerID = ID;
	var myArray = [];
	var enemyArray = [];
	var roundVictories = [];

	_this.winRound = function(roundNumber){
		var roundIndex = roundVictories.indexOf(roundNumber);
		//add it to the round victories iff you haven't already won the round
		//(prevents duplicates)
		if (roundIndex == -1){
			roundVictories.push(roundNumber);
		}
	}

	_this.getNumWins = function(){
		return roundVictories.length;
	}

	_this.getID = function(){
		return playerID;
	}

	_this.readyToStart = function(){
		return Boolean(myArray.length);
	}

	_this.getMyCharacters = function() {
		return myArray;
	}

	simplifyCharacter = function(characterObject){
		return {
				"alive":characterObject.alive,
				"charType":characterObject.getCharacterType(),
				"HUDID":characterObject.charID
			};
	}

	//reset array with important information for allies
	_this.initMyArray = function(allies) {
		myArray = [];
		for (i = 0; i < allies.length; i++){
			myArray.push(simplifyCharacter(allies[i]));
		}
	}

	//reset understanding of the enemy's units
	//used for purpose of the hud
	_this.initEnemyArray = function(enemies) {
		enemyArray = [];
		for (i = 0; i < enemies.length; i++){
			simpleEnemy = simplifyCharacter(enemies[i]);
			simpleEnemy.charType = "undefined"; //obfuscate the enemy type
			enemyArray.push(simpleEnemy);
		}	
	}

	//this would only be called when an ally died, hence the name.
	//updates the hud rep from alive to dead for allies
	_this.allyDied = function(ally){
		var index = myArray.findIndex(x => x.HUDID==ally.charID);
		myArray[index] = simplifyCharacter(ally);
	}

	//get new information about this character
	//used when information is discovered about a character
	//e.g. a dead body is found, an arrow hits a shield, a torch reveals someone
	_this.seeEnemyCharacter = function(character){
		var index = enemyArray.findIndex(x => x.HUDID==character.charID);
		enemyArray[index] = simplifyCharacter(character);
	}

	_this.getHUDInfoSelf = function(){
		return myArray;
	}

	_this.getHUDInfoEnemy = function(){
		return enemyArray;
	}

}
