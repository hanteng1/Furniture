"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreatespiceRack(length) {


    var mid = cylinder({r: 0.4, h: length});
	var right = cube({size: [3, 3.5, 1], center: true}).translate([-0.3, 0.5, length]);
	var left = cube({size: [3, 3.5, 1], center: true}).translate([-0.3, 0.5, 0]);
	var bottom = cube({size: [1, 3.5, length + 1], center: true}).translate([-1.8, 0.5, length/2]);
	
	
	var spiceRack = union(mid, right, left, bottom);
	spiceRack = spiceRack.rotateY(90);
	spiceRack = spiceRack.center();

    var geometry = csgToGeometries(rod)[0];

	return geometry;
}

module.exports = CreatespiceRack