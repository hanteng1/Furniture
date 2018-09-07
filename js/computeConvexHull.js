"use strict;"

const hull = require('./hull')



/**
face: xy, xz, yz
**/

function computeConvexHull(component, face) {

	if(component == undefined) {
		console.log("componennt undefined");
		return;
	}

	if(face !== "xy" && face !== "yz" && face !== "xz")
	{
		console.log("face undefined");
		return;
	}

	var points = collectPointOnFace(component, face);
	console.log(points);

	var concaveHull = hull(points, 20);

	console.log(concaveHull);

	return points;


}


//array.concat()
function collectPointOnFace(component, face) {

	var points = [];

	if(component.children.length > 0) {
		console.log("component has children");

		for(var i = 0; i < component.children.length; i++)
		{
			points = points.concat(collectPointOnFace(component.children[i], face));
		}

	}else
	{
		//ismesh
		//flip the component geometry
		var geometry = component.geometry.clone();
		var matrix = component.matrixWorld.clone();

		geometry.verticesNeedUpdate = true;
		geometry.applyMatrix(matrix);

		var pointsArray = [];
		var verticesAttribute = geometry.getAttribute('position');
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

		//to the face
		for(var i = 0; i < pointsArray.length; i++) {
			var vertex = pointsArray[i];
			var isExist = false;
			if(face == "xy")
			{
				var fv = [vertex[0].toFixed(4), vertex[1].toFixed(4)];
				isExist = false;
				for (var j = 0; j < points.length; j++) {
					if(points[j][0] == fv[0] && points[j][1] == fv[1]){
						isExist = true;
						break;
					}
				}
				if(!isExist)
					points.push(fv);					
				
			}else if(face == "xz"){
				var fv = [vertex[0].toFixed(4), vertex[2].toFixed(4)];
				isExist = false;
				for (var j = 0; j < points.length; j++) {
					if(points[j][0] == fv[0] && points[j][1] == fv[1]){
						isExist = true;
						break;
					}
				}
				if(!isExist)
					points.push(fv);
			}else if(face == "yz"){
				var fv = [vertex[1].toFixed(4), vertex[2].toFixed(4)];
				isExist = false;
				for (var j = 0; j < points.length; j++) {
					if(points[j][0] == fv[0] && points[j][1] == fv[1]){
						isExist = true;
						break;
					}
				}
				if(!isExist)
				points.push(fv);
			}
		}

	}


	return points;
}



module.exports = computeConvexHull