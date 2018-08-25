"use strict;"

const scadApi = require('@jscad/scad-api');
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg');
const csgToGeometries = require('./csgToGeometries');
const assignUVs = require('./assignUVs');

function cadExtrudeShape (shape, path) {

	//remove the last point
	//shape.pop();

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

    //this is not efficient
	solid = solid.expand(0.2, 8);

	var geometry = csgToGeometries(solid)[0];

	geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

	return geometry;
}


module.exports = cadExtrudeShape

