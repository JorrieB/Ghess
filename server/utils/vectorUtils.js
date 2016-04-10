module.exports = {
	vectorSum: function(vec1, vec2){
		return {x:(vec1.x + vec2.x), y:(vec1.y + vec2.y)};
	},

	turnLeft: function(vec){
		return {x: vec.y, y: - vec.x}
	},

	turnRight: function(vec){
		return {x: - vec.y, y:vec.x}
	},

	isEqual: function(v ,w){
		return ((v.x == w.x) && (v.y == w.y));
	},

	inVectorList: function(vectorList, v){
		for (i = 0; i < vectorList.length; i++) { 
			w = vectorList[i];
			if ((v.x == w.x) && (v.y == w.y)){
				return true;
			};
		};
		return false;
	}
};
