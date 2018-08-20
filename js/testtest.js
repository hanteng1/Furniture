function testtest(){

	
	var path = [];

	path.push([1, 1]);
	path.push([2, 2]);
	path.push([3, 3]);

	path = path.map(point => {point[0] -= 1; point[1] -= 1; return point});

	console.log(path);


};


testtest();