"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateRod(length) {
    var mid = cylinder({r: 0.5, h: length});

	var left = cylinder({start: [0,0,0.2], 
	    end: [0,0,0], r1: 1, r2: 1, fn: 50});
	var s1 = difference(sphere({r: 0.2, center:true}),
	    cube({size: 1, center:true}).translate([0,0,-0.4])).translate([0.7,0,0.1]);
	var s2 = s1.translate([-1.1,-0.65,0]);
    var s3 = s1.translate([-1.1,0.65,0]);
    left = union(left, s1, s2, s3);
    
    var right = left.center();
    right = left.rotateX(180);
    right = right.translate([0,0,length]);
    
	var rod = union(left, mid, right);
	rod = rod.rotateY(90);
	rod = rod.center();

	var geometry = csgToGeometries(rod)[0];

	return geometry;
}

module.exports = CreateRod