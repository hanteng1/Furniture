const log = require('./log')
const getParameterDefinitions = require('@jscad/core/parameters/getParameterDefinitions')
const getParameterValues = require('@jscad/core/parameters/getParameterValuesFromUIControls')
const { rebuildSolids, rebuildSolidsInWorker } = require('@jscad/core/code-evaluation/rebuildSolids')
const { mergeSolids } = require('@jscad/core/utils/mergeSolids')

function Processor(){
	this.builder = null;
	this.currentObjects = [];
	this.viewedObject = null;

	//state of the processor
	//0 - initialized
	//1 - processing
	//2 - complete
	//3 - incomplete
	this.state = 0;


}

Processor.mergeSolids = mergeSolids;

Processor.prototype = {

	setCurrentObjects: function(objs) {
		this.currentObjects = objs;
		this.updateView;
	}

	updateView: function() {
		//build a list of objects to view
		
	}
}

