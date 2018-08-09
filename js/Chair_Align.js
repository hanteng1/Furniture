"use strict;"
//chair align related functions
//align in one line
//add seat
const cadMakeSeat = require('./cadMakeSeat')


function Chair_Align (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed


	this.parameters = {

		DISTANCE: 30,
		ANGLE: 0

	};

	//number of furnitures
	var count = 0;

	//seat object
	this.seat;


	//textures
	//load the textures once
	this.textures = {};

}

Chair_Align.prototype = {


	init : function() {
		var manager = new THREE.LoadingManager();
	    manager.onProgress = function ( item, loaded, total ) {
	        console.log( item, loaded, total );
	    };

	    var textureLoader = new THREE.TextureLoader( manager );
	    this.textures["fabric_canyon"] = textureLoader.load( '../model/Fabric-Canyon.jpg' );
	    this.textures["cherry"] = textureLoader.load( '../model/Cherry_Kaffe_Vert.jpg' );

	},


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
		//console.log(`number of chairs: ${count}`);

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
		this.align(this.furnitures, this.parameters.DISTANCE, this.parameters.ANGLE);
	},



	//enable segDistance and segAngle controller
	toggleController: function() {
		
	},

	changeParameterValue: function(pname, value) {
		this.parameters[pname] = value;

		//console.log(this.parameters[pname]);

		this.execute();


		//test
		//console.log(this.furnitures[1].getCornersByName(this.reference));

		// var corners = this.furnitures[1].getCornersByName(this.reference);
		// //draw the corners
		// var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

		// var geometry = new THREE.Geometry();
		// for(var j = 0; j < corners.length; j++) {
		// 	geometry.vertices.push(corners[j]);
		// }
		// var line = new THREE.Line( geometry, material );

		// this.main.scene.add( line );

	},

	//align
	align: function(furnitures, segDistance, segAngle) {

		//console.log("checking *align* operation ... ");

		this.checkLabeledComponents(furnitures);

		if(this.reference == null) return;

		//creat a reference line
		//console.log(`using reference: ${this.reference}`);

		//create a link line from (0, h, 0) to (n, h, 0), where n = count, and h = existing height of the reference component
		//this has some problem
		var refHeight = furnitures[0].getComponentHeight2Floor(this.reference);
		//console.log(`reference height: ${refHeight}`);

		//todo: calculate a suitable seg distance

		this.toggleController();

		//alignment in position
		//make it based on x axis
		var segAngleR = segAngle/180*Math.PI * (-1);

		var destVector = new THREE.Vector3(0, refHeight, 0);
		var segVector = new THREE.Vector3(segDistance, 0, 0);
		
		var refAxis = new THREE.Vector3(0, 1, 0);

		var destNormalVector = new THREE.Vector3(0, 0, 1);
		var correctedNormalVector = new THREE.Vector3();

		for(var i = 0; i < furnitures.length; i++) {
			var furniture = furnitures[i];

			var	origin = new THREE.Vector3();
			origin.copy(furniture.getComponentPosition(this.reference));

			//need to consider the distance and angle at the same time
			//var destination = new THREE.Vector3(segDistance * i, refHeight, 0);
			if(i > 0) {
				segVector.applyAxisAngle(refAxis, segAngleR);
				
				destNormalVector.applyAxisAngle(refAxis, segAngleR);
				//destNormalVector.normalize();

				destVector.add(segVector);
			}

			correctedNormalVector.copy(destNormalVector);
			//an extra angle/2
			correctedNormalVector.applyAxisAngle(refAxis, segAngleR / 2);

			//update the translation
			furniture.moveToPositionWithComponentCenter(destVector, this.reference);

			//update the rotation
			furniture.setRotationWithNormalAxis("back", correctedNormalVector);
			

		}


		this.addSeat(furnitures, this.reference, this.textures);

	},

	
	addSeat: function(furnitures, reference, textures) {

		//here the furnitures should be aligned already along x axis

		
		//get the referenced components and their bounding box
		//should be aligned with the components' size, postion and rotations
		//the important part is getting the four cornners of the compoents
		var scope = this;

		// for(var i = 0; i < furnitures.length; i++) {

		// 	//draw the corners
		// 	var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );

		// 	var geometry = new THREE.Geometry();

		// 	for(let key in furnitures[i].corners) {
		// 		var corners = furnitures[i].corners[key];
		// 		for(var j = 0; j < corners.length; j++) {
		// 			geometry.vertices.push(corners[j]);
		// 		}
		// 	}

		// 	var line = new THREE.Line( geometry, material );

		// 	scope.main.scene.add( line );

		// }

		if(scope.seat != undefined) {
			scope.main.removeFromScene(this.seat);
		}


		//create the seat object
		var innerRaceCorners2D = [];  //use x and z
		var outerRaceCorners2D = [];


		var offsetY = 0;

		for(var i = 0; i < furnitures.length; i++) {
			var corners = furnitures[i].getCornersByName(reference);

			//corners
			//  1 ----- 2
			//  |       |
			//  |       |
			//  4 --|-- 3
			
			let corner_1 = [corners[0].x, corners[0].z];
			let corner_2 = [corners[1].x, corners[1].z];
			let corner_3 = [corners[2].x, corners[2].z];
			let corner_4 = [corners[3].x, corners[3].z];

			//inner
			innerRaceCorners2D.push(corner_1);
			innerRaceCorners2D.push(corner_2);
			//outer race
			outerRaceCorners2D.push(corner_4);
			outerRaceCorners2D.push(corner_3);


			offsetY = corners[0].y;
		}

		outerRaceCorners2D.reverse();

		//csg make seat
		scope.seat = cadMakeSeat(innerRaceCorners2D, outerRaceCorners2D, offsetY, textures);
		scope.main.scene.add( scope.seat );


	}
	

}

module.exports = Chair_Align






