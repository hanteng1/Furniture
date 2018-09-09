"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateLeg(length) {

    var leg = cylinder({start: [0,0,0], end: [0,0,length], r1: 0.3, r2: 0.2, fn: 50});
    leg = leg.rotateX(-90);
    var geometry = csgToGeometries(leg)[0];
	return geometry;
}

module.exports = CreateLeg