"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateHook() {

	var c = cube({size: [0.35,0.05,0.35]});
    var c1 = cube({size: [0.1,0.3,0.1]}).translate([0.1,-0.3,0.06]);
    var c2 = cube({size: [0.1,0.1,0.28]}).translate([0.1,-0.3,0.06]);
    var obj = union(c, c1, c2);
    obj = obj.rotateX(-90);
    obj = obj.center();

    var geometry = csgToGeometries(obj)[0];
	return geometry;
}

module.exports = CreateHook