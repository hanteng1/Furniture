"use strict;"

const scadApi = require('@jscad/scad-api');
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg');
const {union, difference, intersection} = scadApi.booleanOps
const csgToGeometries = require('./csgToGeometries');
const assignUVs = require('./assignUVs');
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')

function cadExtrudeShapeIntersection ( shape1, path1, shape2, path2, shape3, path3 ) {

	var geo1 = cadExtrudeShape( shape1, path1 );
	var geo2 = cadExtrudeShape( shape2, path2 );
	var geo3 = cadExtrudeShape( shape3, path3 );

	var result = intersection( geo1 , geo2 );
	result = intersection( result , geo3 );

	var geometry = csgToGeometries(result)[0];
	
	//var obj = geometryToCsgs(geometry);
	//obj = obj[0].expand(0.2, 3);

	//geometry = csgToGeometries(obj)[0];
	geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    
    assignUVs(geometry);
    
	return geometry;
	
}
function cadExtrudeShape( shape , path){

	//correct path
	if(path.length < 2) {
		return;
	}

	//the order is reversed to the shape position
	var point_last = path[path.length - 1];
	path = path.map(point => {point[0] -= point_last[0]; point[1] -= point_last[1]; point[2] -= point_last[2]; return point});

	
	var sketch = CSG.Polygon.createFromPoints(shape);
    
    var solid = sketch.solidFromSlices({
		numslices: path.length,
		loop: false,
		callback: function(t, slice) {
			
			var vec = new CSG.Vector3D(path[slice][0], path[slice][1], path[slice][2]);
			return this.translate(vec);
		}
	});
    
	return solid;
}
function SimplifyGeo( geometry ){

	var verticesAttribute = geometry.getAttribute('position');
	var verticesArray = verticesAttribute.array;
	var itemSize = verticesAttribute.itemSize;
	var verticesNum = verticesArray.length / itemSize;
	var beforeLength = verticesNum;
	var modifer = new THREE.SimplifyModifier();
	var simplified = modifer.modify( geometry,  beforeLength * 0.8 | 0 );
	
	geometry = new THREE.BufferGeometry().fromGeometry( simplified );
	
	return geometry;

}

module.exports = cadExtrudeShapeIntersection

