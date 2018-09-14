"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateDresserLeg() {
    var leg = cylinder({start: [0,0,0], end: [0,0,5], r1: 1, r2: 2, fn: 50});

    leg = leg.center();
    leg = leg.rotateX(-90);

    leg = leg.scale([0.2,0.2,0.2]); 
    
    var geometry = csgToGeometries(leg)[0];

    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);
    
	return geometry;
}

module.exports = CreateDresserLeg