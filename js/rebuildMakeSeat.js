"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function rebuildMakeSeat ( NewSeatSizex , NewSeatSizey , NewSeatSizez , mode){
	
	if (mode == "NormalSeat"){
		//var seat = geometryToCsgs(geometry);
		var seat = cube({size:[NewSeatSizex , NewSeatSizey , NewSeatSizez]});
		
		var obj = seat.expand(0.3, 16);

		var geometry = csgToGeometries(obj)[0];
		geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    	assignUVs(geometry);
		
		return geometry;
	}
	if (mode == "ThinBoard"){

		var x=NewSeatSizex;
	    var y=NewSeatSizey;
	    var z=NewSeatSizez;
	    var example_cube = cube({size:[x,y,z]});
	    
	    var cube1 = cube({size:[x , y, z*0.04]});
	    var cube2 = cube({size:[x , y, z*0.04]});
	    var cube3 = cube({size:[x , y, z*0.04]});
	    var cube4 = cube({size:[x , y, z*0.04]});
	    var cube5 = cube({size:[x , y, z*0.04]});
	    
	    cube1 = cube1.translate([0 , 0, z*0.2]);
	    cube2 = cube2.translate([0 , 0, z*0.4]);
	    cube3 = cube3.translate([0 , 0, z*0.6]);
	    cube4 = cube4.translate([0 , 0, z*0.8]);
	    cube5 = cube5.translate([0 , 0, z*1.0]);
	    
	    example_cube = difference(example_cube,cube1);
	    example_cube = difference(example_cube,cube2);
	    example_cube = difference(example_cube,cube3);
	    example_cube = difference(example_cube,cube4);
	    example_cube = difference(example_cube,cube5);

	    var geometry = csgToGeometries(example_cube)[0];


	    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    	assignUVs(geometry);

		return geometry;
	}
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

module.exports = rebuildMakeSeat