
//chair align related functions

function Chair_Align (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed

	//two parameters
	this.segAngle = 0;
	this.segDistance = 0;

	//number of furnitures
	var count = 0;
}

Chair_Align.prototype = {

	//see if it has a frame
	checkHasFrame: function(furniture) {
		
		return furniture.hasComponent('midframe');
	},


	checkHasSeat: function(furniture) {
		
		return furniture.hasComponent('seat');
	},

	checkHasBack: function(furniture) {
		
		return furniture.hasComponent('back');
	},

	getFrameHeight2Floor: function(furniture) {
		return furniture.getComponentHeight2Floor('midframe');
	},

	getSeatHeight2Floor: function(furniture) {
		return furniture.getComponentHeight2Floor('seat');
	},




	//////////////////////////////////////////////////////////////////////////
	execute: function(){
		this.align(this.furnitures);
	},

	//align
	align: function(furnitures) {

		console.log("checking *align* operation ... ");

		this.checkLabeledComponents(furnitures);

		if(this.reference == null) return;

		//creat a reference line
		console.log(`using reference: ${this.reference}`);

		//create a link line from (0, h, 0) to (n, h, 0), where n = count, and h = existing height of the reference component
		var refHeight = furnitures[0].getComponentHeight2Floor(this.reference);
		console.log(`reference height: ${refHeight}`);

		//todo: calculate a suitable seg distance
		segDistance = 30;


		for(var i = 0; i < furnitures.length; i++) {
			var furniture = furnitures[i];

			var	origin = new THREE.Vector3();
			origin.copy(furniture.getComponentPosition(this.reference));

			var destination = new THREE.Vector3(segDistance * i, refHeight, 0);

			var translation = new THREE.Vector3();
			translation.subVectors(destination, origin);

			//rotations might be a problem
			furniture.getFurniture().translateX(translation.x);
			furniture.getFurniture().translateY(translation.y);
			furniture.getFurniture().translateZ(translation.z);

		}




	},

	checkLabeledComponents: function(furnitures) {

		count = furnitures.length;
		console.log(`number of chairs: ${count}`);

		//determine reference type
		var hasFrameCount = 0;
		var hasSeatCount = 0;
		for(var i = 0; i < count; i++)
		{
			if(this.checkHasFrame(furnitures[i])) hasFrameCount++;
			if(this.checkHasSeat(furnitures[i])) hasSeatCount++;	
		}

		if(hasFrameCount == count) {
			this.reference = 'midframe';

		}else if(hasSeatCount == count) {
			this.reference = 'seat';
		}else {
			//don't handle for now
			console.log("frame count or seat count not matched");
		}


		//todo: check the height and see whether they are the same
		if(this.reference == 'midframe') {
			//check the height



		}



	},

	//////////////////////////////////////////////////////////////////////////















}








