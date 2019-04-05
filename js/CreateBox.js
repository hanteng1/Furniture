"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')
const assignUVs = require('./assignUVs');


function CreateBox(width, length, height) {
    
    //var width = 1, length = 1.5, height = 0.5;
    var offset = 0.01;
    var obj = cube([length, width - offset, offset / 2]);
    var obj1 = cube([length, offset, height - offset]);
    var obj2 = cube([offset / 2, width - offset, height - offset]);
    var obj3 = cube([length, offset / 2, height - offset]).translate([0 ,width - offset, 0]);
    var obj4 = cube([offset / 2, width - offset / 2, height - offset]).translate([length, 0, 0]);
    obj = union(obj, obj1, obj2, obj3, obj4);
    obj = obj.rotateX(90);
    var geometry = csgToGeometries(obj)[0];

    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);
    
	return geometry;
}

module.exports = CreateBox