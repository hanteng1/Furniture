"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateBlum(width, length, height) {
	var blum1 = cube([length-0.1,0.1,0.1]).translate([0,-0.04,height/2]);
    var blum2 = blum1.translate([0,0,-0.5]);
    var blum3 = blum1.translate([0,width-0.05,0]);
    var blum4 = blum2.translate([0,width-0.05,0]);
    obj = union(blum1, blum2, blum3, blum4);
    obj = obj.rotateX(-90);
    obj = obj.rotateY(-90);
	var geometry = csgToGeometries(obj)[0];

	geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

	
	return geometry;
}

module.exports = CreateBlum