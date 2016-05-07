var utils = require('../utils/vectorUtils');

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

	//return cumulative visibility of players chars
	_this.getVisibility = function(){
		var cumulativeVisibility = [];
		for (charIndex in myArray){
			if (myArray[charIndex].alive){
				cumulativeVisibility = cumulativeVisibility.concat(myArray[charIndex].getVisibleCells());
			}
		}
		return cumulativeVisibility;                                                                                                                                                                                                    
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
		allies.filter(function(character){
			if (character.getPlayerId() == _this.getID()){
				myArray.push(character);
			}
		});
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
		myArray[index] = ally;
	}

	//get new information about this character
	//used when information is discovered about a character
	//e.g. a dead body is found, an arrow hits a shield, a torch reveals someone
	_this.seeCharacter = function(character){
		// If it's your character, don't worry about it
		if (character.getPlayerId() == _this.getID()){
			return;
		}
		var index = enemyArray.findIndex(x => x.HUDID==character.charID);
		enemyArray[index] = simplifyCharacter(character);
	}

	_this.getHUDInfoSelf = function(){
		var simplifiedCharacters = myArray.map(function(character){
			return simplifyCharacter(character);
		});
		return simplifiedCharacters;
	}

	_this.getHUDInfoEnemy = function(){
		return enemyArray;
	}

	//Animation obfuscation functions
	_this.obfuscateAnimations = function(animations){
		//switch on animation type
		var obfuscatedAnimations = [];
		for (index in animations) {
			var animation = animations[index];
			//if the animation is a pass, send it and do what we will with the sound
			if (animation.attack == "pass"){
				obfuscatedAnimations.push(animation);
				continue;
			}

			if (animation.attack == "shield"){
				//TODO: Put onomatopoeia stuff here.
			}

			if (animation.attack == "javelin"){
				//do javelin stuff
				//this is here because javelin stuff might be funky AF
			}

			var heading = utils.getHeading(animation.startPos,animation.endPos);
			//if the animation  takes place on the same square, then we either see it or we don't
			if (heading.x == 0 && heading.y == 0){
				if (isCellVisible(animation.startPos)){
					obfuscatedAnimations.push(animation);
				}
				//if visible, add it to the animations
				continue;
			}

			var tempStart = null;
			var next = animation.startPos;
			var delay = 0;

			while (!utils.isEqual(utils.vectorSum(next,utils.vectorMultScalar(heading,-1)),animation.endPos)){
				if (tempStart == null){
					if (isCellVisible(next)){
						if (Boolean(delay)){
							obfuscatedAnimations.push(makeAnimation({x:0,y:0},{x:delay,y:delay},'delay'));
						}
						delay = 0;
						tempStart = next;		
						next = utils.vectorSum(next,heading);
					} else {
						delay++;
						next = utils.vectorSum(next,heading);
					}
				} else {
					if (isCellVisible(next)){
						if (utils.isEqual(next,animation.endPos)){
							obfuscatedAnimations.push(makeAnimation(tempStart,next,animation.attack));
							tempStart = null;
							next = utils.vectorSum(next,heading);
						} else {
							next = utils.vectorSum(next,heading);
						}
					} else {
						obfuscatedAnimations.push(makeAnimation(tempStart,next,animation.attack));
						tempStart = null;
					}
				}

			}
			//Add an additional delay at the end of your visibility
			if (Boolean(delay)){
				obfuscatedAnimations.push(makeAnimation({x:0,y:0},{x:delay,y:delay},'delay'));
			}
		}
		return obfuscatedAnimations;
	}

	var isCellVisible = function(cell){
		return utils.inVectorList(_this.getVisibility(),cell);
	}

	var makeAnimation = function(start,end,animationType){
		return {
			"attack":animationType,
			"startPos":start,
			"endPos":end
		}
	}


}
