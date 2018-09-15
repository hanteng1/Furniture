"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateDrawer(width, length, height) {
    
    // var width = 1, length = 1.5, height = 0.5;
    var obj = cube([length, width-0.1, 0.05]);
    var obj1 = cube([length, 0.05, height-0.1]);
    var obj2 = cube([0.05, width-0.1, height-0.1]);
    var obj3 = cube([length ,0.05, height-0.1]).translate([0 ,width-0.1, 0]);
    var obj4 = cube([0.05, width, height]).translate([length-0.05, -0.025, 0]);
    var handle = cylinder({r: height/4, h: height/4});
    handle = handle.rotateY(90);
    handle = handle.translate([length,width/2, height/2]);
    obj = union(obj, obj1, obj2, obj3, obj4, handle);
    // obj = obj.center();
    obj = obj.rotateX(-90);
    obj = obj.rotateY(-90);

    var geometry = csgToGeometries(obj)[0];

    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);
    
	return geometry;
}

module.exports = CreateDrawer