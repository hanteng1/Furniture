"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');

function CreateDoor(h, w) {
   	var board = cube({size:[0.1, h - 1, w - 1], center:true});
	var obj = board.expand(0.1, 16);
	var path = new CSG.Path2D([[-0.25, w/8+w/10], 
	[-0.25, w/8], [-0.25-w/20, w/8-w/15], 
	[-0.25-w/20, -1*w/8+w/15], [-0.25, -1*w/8], 
	[-0.25, -1*w/8-w/10]], /*closed=*/false);
	var handle = path.rectangularExtrude(0.2, 1, 16, true);

    handle = handle.translate([0,0, -1*w/2 + w/8]);
    obj = union(obj, handle);
    obj = obj.rotateY(90);

    var geometry = csgToGeometries(obj)[0];

    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

	return geometry;


}

module.exports = CreateDoor