"use strict;"

const scadApi = require('@jscad/scad-api');
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg');
const csgToGeometries = require('./csgToGeometries')


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


function assignUVs(geometry) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}


module.exports = cadExtrudeShape

