"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')


function cadCutByPlane (geometry) {

	//geometry to csg
	var original = geometryToCsgs(geometry)[0];

	var plane = CSG.Plane.fromNormalAndPoint([0, 0, 1], [0, 0, 10]);

	var cube = CSG.cube({
		center: [0, 0, 0],
		radius: [50, 5, 10]
	});

	var part_1 = CSG.polyhedron({
   		points:[ [10,10,0],[10,-10,0],[-10,-10,0],[-10,10,0], // the four points at base
            [0,0,10]  ],                                 // the apex point 
   		faces:[ [0,1,4],[1,2,4],[2,3,4],[3,0,4],              // each triangle side
               [1,0,3],[2,1,3] ]                         // two triangles for square base
		});

	//problem!!!!!
	var cutResult = original.cutByPlane(plane);
	//problem exist whenever there is collision 
	//var cutResult = union(cube, original);


	var result = csgToGeometries(cutResult)[0];

	return result;
}


module.exports = cadCutByPlane

