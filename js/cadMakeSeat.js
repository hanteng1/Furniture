"use strict;"

const scadApi = require('@jscad/scad-api');
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg');
const {cube, sphere, cylinder} = scadApi.primitives3d;
const {union, difference, intersection} = scadApi.booleanOps;
const {translate, rotate} = scadApi.transformations;
const csgToGeometries = require('./csgToGeometries');
const assignUVs = require('./assignUVs');

function cadMakeSeat (innerRace, outerRace, offsetY, textures) {

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
      offset: [0, 0, 0.2],   // direction for extrusion
      twistangle: 0,       // top surface is rotated 30 degrees 
      twiststeps: 0        // create 10 slices
    });

    //expansion... /be careful to use .. very expensive
    //csg = csg.expand(0.4, 8); 

    //get the geometry
    //be careful if there are too many vertices gerneated...
    var geometry = csgToGeometries(csg)[0];

    //make it to geometry
    geometry = new THREE.Geometry().fromBufferGeometry( geometry );
    assignUVs(geometry);

    //console.log(testgeo.faceVertexUvs);

    //simplify the geometry.. seems not necessary
    // var modifer = new THREE.SimplifyModifier();
    // var verticesAttribute = geometry.getAttribute('position');
    // var verticesArray = verticesAttribute.array;
    // var itemSize = verticesAttribute.itemSize;
    // var verticesNum = verticesArray.length / itemSize;
    // geometry = modifer.modify( geometry,  verticesNum * 0.5 | 0 );


    //texture
    var material = new THREE.MeshLambertMaterial( { map: textures["linen"]});
    //var material = new THREE.MeshBasicMaterial( {  wireframe: true});
    //var mesh = new THREE.Mesh(geometry, material);

     var wireframe = new THREE.MeshBasicMaterial({
         color: Math.random() * 0xffffff,
         wireframe: true
     });


     var materialNormal = new THREE.MeshNormalMaterial({
         transparent: true,
         opacity: 0.7
     });


    var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [
         material//,
         //wireframe,
         //materialNormal
     ]);


    mesh.castShadow = true; 
    mesh.receiveShadow = true;

    //todo.. can we set it in the csgtogeometry function? the normal vectors are meshed up
    mesh.translateY(offsetY + 0.2);
    //rotate from y - z
    var tempQuaternion = new THREE.Quaternion();
    tempQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
    mesh.applyQuaternion(tempQuaternion);

    var vertexNormalsHelper = new THREE.VertexNormalsHelper( mesh, 10 );
    mesh.add( vertexNormalsHelper );

    return mesh;

}


module.exports = cadMakeSeat