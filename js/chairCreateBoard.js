"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');

function chairCreateBoard(width, height, depth) {
	var board = cube({size:[width, height, depth]});
	var obj = board.expand(0.012, 16);

	var geometry = csgToGeometries(obj)[0];


	geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);
    
	return geometry;
}


module.exports = chairCreateBoard