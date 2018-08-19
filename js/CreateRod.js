"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateRod(length) {
	var mid = cylinder({r: 0.5, h: length});
	var right = cylinder({start: [0,0,length-0.2], end: [0,0,length], r1: 0.5, r2: 1, fn: 50});
	var left = cylinder({start: [0,0,0.2], end: [0,0,0], r1: 0.5, r2: 1, fn: 50});
	
	var rod = union(left, mid, right);
	rod = rod.rotateY(90);
	rod = rod.center();

	var geometry = csgToGeometries(rod)[0];

	return geometry;
}

module.exports = CreateRod