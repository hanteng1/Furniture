"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {union, difference, intersection} = scadApi.booleanOps
const csgToGeometries = require('./csgToGeometries')
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')


function cadCutByPlane (geometry, cutPlane, intersectpoint, matrixWorld) {

	//geometry to csg
	var original = geometryToCsgs(geometry)[0];

	var up = new THREE.Vector3(0, 0, 1);
	up.applyQuaternion(cutPlane.quaternion);
	up.normalize();

	console.log(up);

	var point = intersectpoint.point.clone();

	var inverseMatrixWorld = new THREE.Matrix4();
	inverseMatrixWorld.getInverse(matrixWorld, true);

	//up.applyMatrix4(inverseMatrixWorld);
	point.applyMatrix4(inverseMatrixWorld);
	var tpos = new THREE.Vector3();
	var tquat = new THREE.Quaternion();
	var tscale = new THREE.Vector3();	

	inverseMatrixWorld.decompose(tpos, tquat, tscale);

	up.applyQuaternion(tquat);

	up.normalize();

	console.log(up);

	var plane = CSG.Plane.fromNormalAndPoint(up, point);

	var part1 = original.cutByPlane(plane);
	var part2 = original.cutByPlane(plane.flipped());

	var result1 = csgToGeometries(part1)[0];
	var result2 = csgToGeometries(part2)[0];

	return [result1, result2];
}


module.exports = cadCutByPlane

