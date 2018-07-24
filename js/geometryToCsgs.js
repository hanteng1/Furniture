const {log, status} = require('./log')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const scadApi = require('@jscad/scad-api')
const {cube, sphere, cylinder, polyhedron} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate} = scadApi.transformations

function geometryToCsgs (initialGeometry){
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

	
	//csg objects
	var csgs = [];
	var divisionSize = 500;
	var divisions = polygonsArray.length / divisionSize;  //could be int or double

	for(var i = 0; i < divisions; i++)
	{
		var divPolygonsArray = polygonsArray.slice(i * divisionSize, (i + 1) * divisionSize);
		var divPointsArray = [];
		var newDivPolygonsArray = [];

		for(var j = 0; j < divPolygonsArray.length; j++)
		{
			divPointsArray.push(pointsArray[divPolygonsArray[j][0]]);
			divPointsArray.push(pointsArray[divPolygonsArray[j][1]]);
			divPointsArray.push(pointsArray[divPolygonsArray[j][2]]);

			var divPolygon  = divPolygonsArray[j].map(x => x - i * divisionSize * 3); 
			newDivPolygonsArray.push(divPolygon);
		}

		csgs.push(union(
			polyhedron({points: divPointsArray, 
				//correct the div polygon array
				polygons: divPolygonsArray.map(polygon => polygon.map(x => x - i * divisionSize * 3)) 
			}))
		);
	}

	//return the divided arrays	
	return csgs;
}

function unionCsgs(csgs) {
	return union(csgs[2]);//union(csgs);
}


module.exports = {geometryToCsgs, unionCsgs};