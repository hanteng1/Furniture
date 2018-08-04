
//chair align related functions
//align in one line
//add seat

function Chair_Align (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed

	//two parameters
	this.segAngle = 0;
	this.segDistance = 30;


	this.parameters = {

		DISTANCE: this.segDistance,
		ANGLE: this.segAngle

	};

	//number of furnitures
	var count = 0;
}

Chair_Align.prototype = {

	//////////////////////////////////////////////////////////////////////////
	//check and get information
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
	//make transformation

	execute: function(){
		this.align(this.furnitures, this.segDistance, this.segAngle);
	},



	//enable segDistance and segAngle controller
	toggleController: function() {
		
	},

	changeParameterValue: function(pname, value) {
		this.parameters[pname] = value;

		console.log(value);

		//this.execute();
	},

	//align
	align: function(furnitures, segDistance, segAngle) {

		console.log("checking *align* operation ... ");

		this.checkLabeledComponents(furnitures);

		if(this.reference == null) return;

		//creat a reference line
		console.log(`using reference: ${this.reference}`);

		//create a link line from (0, h, 0) to (n, h, 0), where n = count, and h = existing height of the reference component
		//this has some problem
		var refHeight = furnitures[0].getComponentHeight2Floor(this.reference);
		console.log(`reference height: ${refHeight}`);

		//todo: calculate a suitable seg distance

		this.toggleController();

		//alignment in position
		for(var i = 0; i < furnitures.length; i++) {
			var furniture = furnitures[i];

			var	origin = new THREE.Vector3();
			origin.copy(furniture.getComponentPosition(this.reference));

			var destination = new THREE.Vector3(segDistance * i, refHeight, 0);

			var translation = new THREE.Vector3();
			translation.subVectors(destination, origin);

			//the translation has no problem
			//console.log(translation);

			//correct the transition using the furniture's current orientation
			var quaternion = new THREE.Quaternion();
			quaternion.copy(furniture.quaternion);
			quaternion.inverse();
			translation.applyQuaternion(quaternion);

			//rotations might be a problem
			//has to consider the oritation
			furniture.getFurniture().translateX(translation.x);
			furniture.getFurniture().translateY(translation.y);
			furniture.getFurniture().translateZ(translation.z);

			//update the position info
			furniture.updatePosition();


			//apply rotations, calcute a rotation vector
			

		}


		this.addSeat(furnitures, this.reference);

	},

	
	addSeat: function(furnitures, reference) {

		//here the furnitures should be aligned already along x axis

		
		//get the referenced components and their bounding box
		//should be aligned with the components' size, postion and rotations
		//the important part is getting the four cornners of the compoents
		var scope = this;

		var bBoxes = [];

		for(var i = 0; i < furnitures.length; i++) {
			var refComponent = furnitures[i].getComponentByName(reference);

			var bBox = new THREE.BoxHelper(refComponent, 0xffffff);

			bBox.renderOrder = Infinity;
			scope.main.scene.add(bBox);

			bBoxes.push(bBox);
		}

	}
	















}








