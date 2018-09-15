"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

const assignUVs = require('./assignUVs');


function CreateDoorBoard (length, height){

	// var length = 2;
 	// var height = 7;
   
    var obj = cube({size: [0.1,length,height]});

	var obj1 = cube({size: [0.4,length/10,height]}).translate([-0.25,0,0]);
	obj1 = obj1.translate([0.1,0,0]);
	var obj2 = obj1.translate([0,length-length/10,0]);
	
	var obj3 = cube({size: [0.4,length,height/10]}).translate([-0.15,0,height - height/10]);
	var obj4 = obj3.translate([0,0,-height/10-1]);
	var obj5 = obj3.translate([0,0,-height+height/10+height/10+1]);
	var obj6 = obj3.translate([0,0,-height+height/10]);
	obj = union(obj, obj1, obj2, obj3, obj4, obj5, obj6);
    obj = obj.center();
    
	obj = obj.rotateX(90);
	var geometry = csgToGeometries(obj)[0];
	return geometry;

}


module.exports = CreateDoorBoard