"use strict;"


const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CabinetMakeBedBroad( x , y , z ){
	var broad = cube({size:[ x , y , z ]});

	var cube1 = cube({size:[x , y, z*0.04]});
	var cube2 = cube({size:[x , y, z*0.04]});
	var cube3 = cube({size:[x , y, z*0.04]});
	var cube4 = cube({size:[x , y, z*0.04]});
	var cube5 = cube({size:[x , y, z*0.04]});
	var cube6 = cube({size:[x , y, z*0.04]});
	var cube7 = cube({size:[x , y, z*0.04]});
	var cube8 = cube({size:[x , y, z*0.04]});
	var cube9 = cube({size:[x , y, z*0.04]});
	var cube10= cube({size:[x , y, z*0.04]});
	    
	cube1 = cube1 .translate([0 , 0, z*0.0]);
	cube2 = cube2 .translate([0 , 0, z*0.1]);
	cube3 = cube3 .translate([0 , 0, z*0.2]);
	cube4 = cube4 .translate([0 , 0, z*0.3]);
	cube5 = cube5 .translate([0 , 0, z*0.4]);
	cube6 = cube6 .translate([0 , 0, z*0.5]);
	cube7 = cube7 .translate([0 , 0, z*0.6]);
	cube8 = cube8 .translate([0 , 0, z*0.7]);
	cube9 = cube9 .translate([0 , 0, z*0.8]);
	cube10= cube10.translate([0 , 0, z*0.9]);
	    
	broad = difference(broad , cube1 );
	broad = difference(broad , cube2 );
	broad = difference(broad , cube3 );
	broad = difference(broad , cube4 );
	broad = difference(broad , cube5 );
	broad = difference(broad , cube6 );
	broad = difference(broad , cube7 );
	broad = difference(broad , cube8 );
	broad = difference(broad , cube9 );
	broad = difference(broad , cube10);

	var geometry = csgToGeometries(broad)[0];

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

module.exports = CabinetMakeBedBroad
