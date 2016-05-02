module.exports = function(message, game, playerId) {
    var isValid = false;

    if (! (game.canStart()) ){
        return false;
    }

    switch(message.type) {
    case "move":
        isValid = game.handleMove(message.objectPosition, message.targetPosition, playerId);
        break;
    case "turn":
        isValid = game.handleTurn(message.objectPosition, message.newHeading, playerId);
        break;
    case "attack":
        isValid = game.handleAttack(message.objectPosition, message.targetPosition, playerId);
        break;
    case "pass":
        isValid = game.handlePass(playerId);
    default:
        //
    }
    return isValid;
};