"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateBlum(width, length, height) {
	var blum1 = cube([length-0.8,0.2,0.2]).translate([0.2,-0.2,height/2-1]);
    var blum2 = cube([length-0.8,0.2,0.2]).translate([0.2,-0.2,height/2-1.5]);
    var blum3 = cube([length-0.8,0.2,0.2]).translate([0.2,width-0.5,height/2-1]);
    var blum4 = cube([length-0.8,0.2,0.2]).translate([0.2,width-0.5,height/2-1.5]);
    obj = union(blum1, blum2, blum3, blum4);
    obj = obj.rotateX(-90);
    obj = obj.rotateY(-90);
	var geometry = csgToGeometries(obj)[0];

	geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

	
	return geometry;
}

module.exports = CreateBlum