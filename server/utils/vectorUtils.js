module.exports = {
	vectorSum: function(vec1, vec2){
		return {x:(vec1.x + vec2.x), y:(vec1.y + vec2.y)};
	};

	turnLeft: function(vec){
	newVec = {x: vec.y, -y:vec.x}
	};

	turnRight: function(vec){
	newVec = {x:- vec.y, y:vec.x}
	};
};
