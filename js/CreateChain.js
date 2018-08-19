"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateChain(length) {

	var r = cube({size: [6,2,4], round: true}).translate([0,1,0]);
	var tmp1= cube({size: [4,4,2], round: true}).translate([1,0,1]);
	r = difference(r, tmp1);

	for (var i = 0; i < length; i+=8) {
		var tmp = cube({size: [6,2,4], round: true}).translate([0 + i,1,0]);
	    var tmp1= cube({size: [4,4,2], round: true}).translate([1 + i,0,1]);
	    var res = difference(tmp, tmp1);

		var obj = cube({size: [6,4,2], round: true}).translate([4 + i,0,1]);
	    var obj1= cube({size: [4,2,4], round: true}).translate([5 + i,1,0]);
	    var result = difference(obj, obj1);    

	    r = union(r, result, res);
	}
	
    r = r.scale(0.1, 0.1, 0.1);
    r = r.rotateY(90);
    r = r.center();

    var geometry = csgToGeometries(r)[0];

	return geometry;

}

module.exports = CreateChain