"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CabinetMakeBroad ( broad_x , broad_y , broad_z ){

	var seat = cube({size:[ broad_x , broad_y , broad_z ]});

	var geometry = csgToGeometries(seat)[0];
	return geometry;

}

module.exports = CabinetMakeBroad