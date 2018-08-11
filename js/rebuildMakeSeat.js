"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function rebuildMakeSeat ( NewSeatSizex , NewSeatSizey , NewSeatSizez , mode){
	
	if (mode == "NormalSeat"){
		//var seat = geometryToCsgs(geometry);
		var seat = cube({size:[NewSeatSizex , NewSeatSizey , NewSeatSizez]});
		seat = seat.rotateX(30);
		var obj = seat.expand(0.3, 16);

		var geometry = csgToGeometries(obj)[0];
		return geometry;
	}
	if (mode == "ThinBoard"){

		var x=NewSeatSizex;
	    var y=NewSeatSizey;
	    var z=NewSeatSizez;
	    var example_cube = cube({size:[x,y,z]});
	    
	    var cube1 = cube({size:[x*0.04, y, z]});
	    var cube2 = cube({size:[x*0.04, y, z]});
	    var cube3 = cube({size:[x*0.04, y, z]});
	    var cube4 = cube({size:[x*0.04, y, z]});
	    var cube5 = cube({size:[x*0.04, y, z]});
	    
	    cube1 = cube1.translate([x*0.0, 0, 0]);
	    cube2 = cube1.translate([x*0.2, 0, 0]);
	    cube3 = cube1.translate([x*0.4, 0, 0]);
	    cube4 = cube1.translate([x*0.6, 0, 0]);
	    cube5 = cube1.translate([x*0.8, 0, 0]);
	    
	    example_cube = difference(example_cube,cube1);
	    example_cube = difference(example_cube,cube2);
	    example_cube = difference(example_cube,cube3);
	    example_cube = difference(example_cube,cube4);
	    example_cube = difference(example_cube,cube5);

	    var geometry = csgToGeometries(example_cube)[0];
		return geometry;
	}
}

module.exports = rebuildMakeSeat