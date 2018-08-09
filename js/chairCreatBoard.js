"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function chairCreatBoard(width, height, depth) {
	var board = cube({size:[width, height, depth]});
	var obj = board.expand(0.3, 16);

	var geometry = csgToGeometries(obj)[0];

	return geometry;
}


module.exports = chairCreatBoard