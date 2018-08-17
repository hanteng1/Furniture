"use strict;"

const scadApi = require('@jscad/scad-api')
const { CSG, CAG, isCSG, isCAG } = require('@jscad/csg')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate, rotate} = scadApi.transformations
const csgToGeometries = require('./csgToGeometries')
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')

function dresserCutSpace(cabinet, center, radius) {

  var obj = geometryToCsgs(cabinet);
  
  var plane = CSG.Plane.fromNormalAndPoint([0, 0, 1], [0, 0, 0 + radius.z]);
  
  var half_part = obj[0].cutByPlane(plane);

  var geometry = csgToGeometries(half_part)[0];  

  return geometry;
}


module.exports = dresserCutSpace