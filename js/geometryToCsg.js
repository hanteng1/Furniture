const {log, status} = require('./log')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const scadApi = require('@jscad/scad-api')
const {cube, sphere, cylinder, polyhedron} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate} = scadApi.transformations

function geometryToCsg (initialGeometry){
	var pointsArray = [];
	var polygonsArray = [];

	var verticesAttribute = initialGeometry.getAttribute('position');
	var verticesArray = verticesAttribute.array;
	var itemSize = verticesAttribute.itemSize;
	var verticesNum = verticesArray.length / itemSize;

	for(var i = 0; i < verticesNum; i++)
	{
		var vertex = [verticesArray[i * itemSize + 0], 
		   verticesArray[i * itemSize + 1],
		   verticesArray[i * itemSize + 2]];

		pointsArray.push(vertex);
	}

	for(var j = 0; j < verticesNum / 3; j++)
	{
		var polygon = [ j * 3 + 0, j * 3 + 1, j * 3 + 2 ];
		polygonsArray.push(polygon);
	}


	//divide into parts
	//for ease of operations
	

	return union(
		//objects: 1
		polyhedron({points: pointsArray, 
			polygons: polygonsArray})

	);
}

module.exports = geometryToCsg