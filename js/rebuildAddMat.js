"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function rebuildAddMat( NewSeatSizex , NewSeatSizey , NewSeatSizez ){

	var seat = cube({size:[NewSeatSizex-0.3 , NewSeatSizey-0.3 , NewSeatSizez-0.3]});
	var obj = seat.expand(0.3, 16);

	var geometry = csgToGeometries(obj)[0];
	return geometry;

}

module.exports = rebuildAddMat