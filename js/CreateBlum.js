"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateBlum(width, length, height) {
	var blum1 = cube([length-0.1,0.05,0.05]).translate([0.1,-0.05,0]);
    var blum2 = cube([length-0.1,0.05,0.05]).translate([0.1,-0.05,0.15]);
    var blum3 = cube([length-0.1,0.05,0.05]).translate([0.1,width-0.1,0]);
    var blum4 = cube([length-0.1,0.05,0.05]).translate([0.1,width-0.1,0.15]);
    obj = union(blum1, blum2, blum3, blum4);
    obj = obj.rotateX(-90);
    obj = obj.rotateY(-90);
	var geometry = csgToGeometries(obj)[0];
	return geometry;
}

module.exports = CreateBlum