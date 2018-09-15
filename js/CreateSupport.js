"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');

function CreateSupport(length) {
    var mid = cylinder({r: 0.4, h: length});
    
    var left = cylinder({start: [0,0,0.1], 
	    end: [0,0,0], r1: 0.7, r2: 0.7, fn: 50});
	var s1 = difference(sphere({r: 0.15, center:true}),
	    cube({size: 0.75, center:true}).translate([0,0,-0.3])).translate([0.55,0,0.03]);
	var s2 = s1.translate([-0.9,-0.4,0]);
    var s3 = s1.translate([-0.9,0.4,0]);
    left = union(left, s1, s2, s3);
    
    var right = left.center();
    right = left.rotateX(180);
    right = right.translate([0,0,length]);
    
	var rod = union(left, mid, right);
	rod = rod.rotateX(90);
	rod = rod.center();
	var geometry = csgToGeometries(rod)[0];

	geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

	return geometry;
}

module.exports = CreateSupport