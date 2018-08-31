"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function CreateDrawer(width, length, height) {
    
    // var width = 10, length = 15, height = 5;
    // var width = 1, length = 1.5, height = 0.5;
    var obj = cube([length, width-0.15, 0.05]);
    var obj1 = cube([length, 0.05, height-0.1]);
    var obj2 = cube([0.05, width-0.15, height-0.1]);
    var obj3 = cube([length ,0.05, height-0.1]).translate([0 ,width-0.15, 0]);
    var obj4 = cube([0.05, width, height]).translate([length-0.05, -0.05, 0]);
    
    var w = width;
    var tmp = 0.05;
    var path = new CSG.Path2D([[tmp, w/8+w/10], [tmp, w/8], [tmp-w/20, w/8-w/15], 
        [tmp-w/20, -1*w/8+w/15], [tmp, -1*w/8], [tmp, -1*w/8-w/10]], /*closed=*/false);
    var handle = path.rectangularExtrude(0.02, 0.2, 16, true);
    //handle = handle.center();
    handle = handle.rotateY(180);
    
    
    handle = handle.translate([length+0.05,(width-0.1)/2,(height+0.2)/2]);
    obj = union(obj, obj1, obj2, obj3, obj4, handle);
    // obj = obj.center();
    obj = obj.rotateX(-90);
    obj = obj.rotateY(-90);

    var geometry = csgToGeometries(obj)[0];
	return geometry;
}

module.exports = CreateDrawer