"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CabinetMakeSeat ( cabinet_L , cabinet_W ){

	var cabinet_H = 1;
	var seat = cube({size:[cabinet_L , cabinet_H , cabinet_W]});
		
	var obj = seat.expand(0.3, 16);

	var geometry = csgToGeometries(obj)[0];
	return geometry;

}


module.exports = CabinetMakeSeat