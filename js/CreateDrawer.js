"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateDrawer(width, length, height) {
    
    // var width = 10, length = 15, height = 5;
    var obj = cube([length, width-1, 0.5]);
    var obj1 = cube([length, 0.5, height-1]);
    var obj2 = cube([0.5, width-1, height-1]);
    var obj3 = cube([length ,0.5, height-1]).translate([0 ,width-1, 0]);
    var obj4 = cube([0.5, width, height]).translate([length-0.5, -0.25, 0]);
    
    var path = new CSG.Path2D([[-0.25, width/8+width/10], [-0.25, width/8], 
    [-0.25-width/20, width/8-width/15], [-0.25-width/20, -1*width/8+width/15], 
    [-0.25, -1*width/8], [-0.25, -1*width/8-width/10]],false);
	var handle = path.rectangularExtrude(0.2, 1, 10, true);
	//handle = handle.center();
	handle = handle.rotateY(180);
	
	
	handle = handle.translate([length-0.2,width/2,(height+1)/2]);
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