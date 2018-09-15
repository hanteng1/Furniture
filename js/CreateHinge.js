"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateHinge(RAngle, mode) {

	var board1 = cube({size:[2, 4.3, 0.1], center:true}).translate([-1.1,0.15,-0.5]);
    var s1 = difference(sphere({r: 0.5, center:true}),cube({size: 2.5, center:true}).translate([0,0,-1])).translate([-1.2,0.1,-0.8]);
    var s2 = s1.translate([0,1.5,0]);
    var s3 = s1.translate([0,-1.5,0]);
    var left = union(board1, s1, s2, s3);
    left = left.scale([0.5,0.5,0.5]);
    var c1 = cylinder({start: [0,-2,0], end: [0,-1,0], r1: 0.5, r2: 0.5, fn: 50});
    c1 = c1.scale([0.5,0.5,0.5]);
    var c3 = cylinder({start: [0,0.2,0], end: [0,1.2,0], r1: 0.5, r2: 0.5, fn: 50});
    c3 = c3.scale([0.5,0.5,0.5]);
    
    var board2 = cube({size:[2, 4.3, 0.1], center:true}).translate([1.1,0.15,-0.5]);
    var s4 = s1.translate([2.5,0,0]);
    var s5 = s2.translate([2.5,0,0]);
    var s6 = s3.translate([2.5,0,0]);
    var right = union(board2, s4, s5, s6);
    right = right.scale([0.5,0.5,0.5]);

    right = right.rotateY(RAngle);
    
    var c2 = cylinder({start: [0,-0.9,0], end: [0,0.1,0], r1: 0.5, r2: 0.5, fn: 50});
    c2 = c2.scale([0.5,0.5,0.5]);
    var c4 = cylinder({start: [0,1.3,0], end: [0,2.3,0], r1: 0.5, r2: 0.5, fn: 50});
    c4 = c4.scale([0.5,0.5,0.5]);
    var c = cylinder({start: [0,-2.1,0], end: [0,2.4,0], r1: 0.3, r2: 0.3, fn: 50});
   	c = c.scale([0.5,0.5,0.5]);
    var hinge = union(left, c, c1, c3, c2, c4, right);
    hinge = hinge.scale([0.4,0.4,0.4]); 
    // left to right (1) // up to down (2) + (1)
    if(mode == "upToDown") 
    	hinge = hinge.rotateX(-90); // (2)
    hinge = hinge.rotateY(-90); // (1)    

    var geometry = csgToGeometries(hinge)[0];


    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);
    
    return geometry;

}

module.exports = CreateHinge