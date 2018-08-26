"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateSpiceRack(length) {

    var mid = cylinder({r: 0.05, h: length});
	var right = cube({size: [0.4, 0.5, 0.1], center: true}).translate([-0.03, 0.09, length]);
	var left = cube({size: [0.4, 0.5, 0.1], center: true}).translate([-0.03, 0.09, 0]);
	var bottom = cube({size: [0.1, 0.5, length + 0.1], center: true}).translate([-0.18, 0.09, length/2]);
	
	var spiceRack = union(mid, right, left, bottom);	
	spiceRack = spiceRack.center();	
	spiceRack = spiceRack.rotateZ(90);
    var geometry = csgToGeometries(spiceRack)[0];

	return geometry;
}

module.exports = CreateSpiceRack