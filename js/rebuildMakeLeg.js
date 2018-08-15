"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')


function rebuildMakeLeg ( Leg_r , Leg_h ){

	var Leg = cylinder({r: Leg_r  , 
                        h: Leg_h} );
	Leg = Leg.rotateX(-90);
	var geometry = csgToGeometries(Leg)[0];
	return geometry;

}


module.exports = rebuildMakeLeg