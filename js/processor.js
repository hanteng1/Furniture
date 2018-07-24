const log = require('./log')
const getParameterDefinitions = require('@jscad/core/parameters/getParameterDefinitions')
const getParameterValues = require('@jscad/core/parameters/getParameterValuesFromUIControls')
const { rebuildSolids, rebuildSolidsInWorker } = require('@jscad/core/code-evaluation/rebuildSolids')
const { mergeSolids } = require('@jscad/core/utils/mergeSolids')
const scadApi = require('@jscad/scad-api')
const {cube, sphere, cylinder} = scadApi.primitives3d
const {union, difference, intersection} = scadApi.booleanOps
const {translate} = scadApi.transformations
const csgToGeometries =  require('./csgToGeometries')
const {geometryToCsgs, unionCsgs} = require('./geometryToCsgs')


function hinge()
{

	var hingeCsg = union(
		cube({size: [30, 150, 30], center: true})
	).translate([0, 75, 0]);

	return csgToGeometries(hingeCsg)[0];
}

function hinge2Csg()
{
	return union(
		cube({size: [30, 150, 30], center: true})
	).translate([0, 75, 0]);
}

function addHinge(initialGeo)
{
	var hingeCsg = hinge2Csg();

	var addHingeCsg = difference(
		geometryToCsg(initialGeo),
		hingeCsg
	);

	return csgToGeometries(addHingeCsg)[0];
}



module.exports = {hinge, addHinge}
