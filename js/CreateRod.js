"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateRod(length) {
    var mid = cylinder({r: 0.2, h: length});
    
    var left = cylinder({start: [0,0,0.2], 
	    end: [0,0,0], r1: 0.5, r2: 0.5, fn: 50});
	var s1 = difference(sphere({r: 0.11, center:true}),
	    cube({size: 0.55, center:true}).translate([0,0,-0.22])).translate([0.35,0,0.15]);
	var s2 = s1.translate([-0.5,-0.3,0]);
    var s3 = s1.translate([-0.5,0.3,0]);
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