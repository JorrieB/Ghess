#Ghess
The best competitive multiplayer game.

##Networking
###Server to client message
####Board state:
Whose turn it is.

Controller object:

*  Team
*  Type
*  Visibility
*  Attack
*  Location

####Animations:
[['arrow', [[3,3],[3,6]],...]

##Client to server message
####Type:

*  Pass
*  Attack
*  Move
*  Turn

####Location
For a pass, it will just return the current location.



