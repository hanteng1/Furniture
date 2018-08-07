"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')

function cadMakeSeat (innerRace, outerRace, offsetY) {

	var innerStart = innerRace.slice(0, 1);
	//console.log(innerStart);

	var innerTheothers = innerRace.slice(1);
	//console.log(innerTheothers);

	var outerStart = outerRace.slice(0, 1);
	//console.log(outerStart);

	var outerTheothers = outerRace.slice(1);
	//console.log(outerTheothers);

	var path = new CSG.Path2D(innerStart);  // beware of the double array: we must pass an array of 2d coordinates
    path = path.appendBezier(innerTheothers);
    path = path.appendPoint(outerStart[0]);
   	path = path.appendBezier(outerTheothers);

    // close the path and convert to a solid 2D shape:
    path = path.close();
    var cag = path.innerToCAG();
    var csg = cag.extrude({
      offset: [0.5, 0, 2],   // direction for extrusion
      twistangle: 0,       // top surface is rotated 30 degrees 
      twiststeps: 0        // create 10 slices
    });

    //get the geometry
    //be careful if there are too many vertices gerneated...
    var geometry = csgToGeometries(csg)[0];
    var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 });

    var mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.translateY(offsetY);

    return mesh;

}



module.exports = cadMakeSeat