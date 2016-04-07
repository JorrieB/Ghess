module.exports = function(message, game) {
    switch(message.type) {
    case "move":
        game.handleMove(message.objectPosition, message.targetPosition);
        break;
    case "turn":
        game.handleTurn(message.objectPosition, message.newHeading);
        break;
    case "attack":
        game.handleAttack(message.objectPosition, message.targetPosition);
        break;
    case "pass":
        break
    default:
        //
}
};