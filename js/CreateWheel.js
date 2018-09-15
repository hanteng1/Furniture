"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');

function CreateWheel() {

	var c1 = cylinder({r: 0.4, h: 0.1});
    c2 = c1.translate([0,0,0.4]);
    var h = cylinder({r: 0.3, h: 0.3});
    h = h.translate([0,0,0.1]);
    // touch array 0.28 * 0.28
    h2 = cylinder({r: 0.14, h: 0.5}).translate([0,0.25,0.125]);
    h2 = h2.rotateX(90);
    obj = union(c1, c2, h, h2);
    obj = obj.rotateZ(180);
    obj = obj.center();

	var geometry = csgToGeometries(obj)[0];

    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

	return geometry;
}


module.exports = CreateWheel