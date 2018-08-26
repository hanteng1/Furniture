"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateDresserLeg() {
    var leg = cylinder({start: [0,0,0], end: [0,0,1.5], r1: 0.5, r2: 0.8, fn: 50});
    leg = leg.center();
    leg = leg.rotateX(-90);
    var geometry = csgToGeometries(leg)[0];
	return geometry;
}

module.exports = CreateDresserLeg