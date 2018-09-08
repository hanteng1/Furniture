"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateTableRod(length) {

	// var length = 5;
    var obj = cylinder({r: 0.3, h: length});
    var obj1 = cube({size: [1,0.6,0.05]}).translate([0,-0.3,0]);
	var obj2 = obj1.translate([0,0,length-0.05]);
	var obj3 = cube({size: [0.05,2,0.5]}).translate([1,-1,0]);
	var obj4 = obj3.translate([0,0,length-0.5]);
	
	var s1 = difference(sphere({r: 0.1, center:true}),
	    cube({size: 0.75, center:true}).translate([0.35,0,0])).translate([1.05,-0.5,0.25]);
	var s2 = s1.translate([0,1,0]);
	var s3 = s1.translate([0,0,length-0.5]);
	var s4 = s2.translate([0,0,length-0.5]);
	obj = union(obj, obj1, obj2, obj3, obj4, s1, s2, s3, s4);
	obj = obj.center();

	var geometry = csgToGeometries(obj)[0];

	return geometry;
}


module.exports = CreateTableRod