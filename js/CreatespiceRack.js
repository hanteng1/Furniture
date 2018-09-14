"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateSpiceRack(length) {

    var radius = 0.2;
    var mid = cylinder({r: 0.15, h: length});
	var right = cube({size: [radius * 4, radius * 4 + 0.05, 0.1], 
	    center: true}).translate([radius/2, radius, 0]);
	var left = right.translate([0, 0, length]);
	var bottom = cube({size: [0.1, radius * 4 + 0.05, length + 0.1], 
	center: true}).translate([radius * 2, radius, length/2]);	
	
	var spiceRack = union(mid, right, left, bottom);	
	
	spiceRack = spiceRack.rotateZ(-90);
	spiceRack = spiceRack.rotateY(180);
	spiceRack = spiceRack.center();	
    var geometry = csgToGeometries(spiceRack)[0];

    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);
    
	return geometry;
}

module.exports = CreateSpiceRack