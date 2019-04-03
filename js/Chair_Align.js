"use strict;"
//chair align related functions
//align in one line
//add seat
const cadMakeSeat = require('./cadMakeSeat');
const computeConvexHull = require('./computeConvexHull');
const chairCutBack = require('./chairCutBack');
const rebuildMakeLeg = require('./rebuildMakeLeg');

function Chair_Align (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed

	this.cornerAdded = false;

	this.parameters = {

		DISTANCE: 5,
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
	    this.textures["linen"] = textureLoader.load( '../images/linen_cloth.jpg' );

	    this.textures["linen"].repeat.set(0.1, 0.1);
		this.textures["linen"].wrapS = this.textures["linen"].wrapT = THREE.MirroredRepeatWrapping;


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

	execute: function(tfname){

		

		if(tfname == "vertical"){


			if(this.cornerAdded == false) {
				for(var i = 0; i < this.furnitures.length; i++) {
					this.furnitures[i].addCorners();
					this.furnitures[i].addtoPoint();
				}
				this.cornerAdded = true;
			}

			this.align(this.furnitures, this.parameters.DISTANCE, this.parameters.ANGLE);
			this.addSeat(this.furnitures, this.reference, this.textures);

		}else if(tfname == "horizontal") {


			if(this.cornerAdded == false) {
				for(var i = 0; i < this.furnitures.length; i++) {
					this.furnitures[i].addCorners();
					this.furnitures[i].addtoPoint();
				}
				this.cornerAdded = true;
			}

			for(var angle = 0; angle <= 180; angle ++){
				this.parameters.ANGLE = angle;
				this.align(this.furnitures, this.parameters.DISTANCE, angle);
			}
			
			this.addSeat(this.furnitures, this.reference, this.textures);

		}else if(tfname == "flip") {

			if(this.cornerAdded == false) {
				for(var i = 0; i < this.furnitures.length; i++) {
					this.furnitures[i].addCorners();
					this.furnitures[i].addtoPoint();
				}
				this.cornerAdded = true;
			}
			

			this.cut(this.furnitures);

			//rotate
			for(var angle = 0; angle <= 180; angle+=2){
				this.parameters.ANGLE = angle;
				this.align(this.furnitures, this.parameters.DISTANCE, angle);
			}

			//flip
			//this.flip(this.furnitures);

			//seat
			//this.addSeat(this.furnitures, this.reference, this.textures);


			//move upwards
			//this.seat.translateZ(-0.6);

		}else if(tfname == "connect1"){

			this.backConnect1(this.furnitures);
			
		}else if(tfname == "connect2"){

			this.backConnect2(this.furnitures);
		}
		
	},

	checkHasMidFrame: function(furniture) {	
		var seat = furniture.getObjectByName("seat");	
		var seat_centr = this.getPartCenter(seat);
		var seat_size = this.getPartSize(seat);
		var array = new Array();
		var array_centerPosition = new Array();
		var array_size = new Array();

		for (var i = furniture.children.length - 1; i >= 0 ; i--) {				
			var str = furniture.children[i].name;
			if (str == "") {
				array.push(furniture.children[i]);
				array_centerPosition.push(this.getPartCenter(furniture.children[i]));
				array_size.push(this.getPartSize(furniture.children[i]));
			}
		}

		var checkBox = new THREE.Box3();
		checkBox.setFromObject(seat);
		for (var i = 0; i < array.length; i++) {
			var box = new THREE.Box3();
			box.setFromObject(array[i]);
			if(checkBox.intersectsBox(box)){
				var point = array_centerPosition[i];
				var max = seat_centr.y + seat_size.y * 2;
				var min = seat_centr.y - seat_size.y * 2;
				if(point.y >= min && point.y <= max)
					array[i].name = "midframe";
			}
		}
	},

	checkHasLeg: function(furniture) {	
		var seat = furniture.getObjectByName("seat");	
		var seat_centr = this.getPartCenter(seat);
		var seat_size = this.getPartSize(seat);
		var array = new Array();

		for (var i = furniture.children.length - 1; i >= 0 ; i--) {				
			var str = furniture.children[i].name;
			if (str == "")
				array.push(furniture.children[i]);
		}
		
		var checkBox = new THREE.Box3();
		checkBox.setFromObject(seat);
		for (var i = 0; i < array.length; i++) {
			var box = new THREE.Box3();			
			box.setFromObject(array[i]);
			if(checkBox.intersectsBox(box)){
				array[i].name = "leg";
			}
		}
		
	},


	getPartSize: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);

		//this includes width, height, depth
		return box_size;
	},

	getPartCenter: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_center = new THREE.Vector3();
		box.getCenter (box_center);

		return box_center;
	},


	hasChildren: function(obj){
		if (obj.children.length != 0)
			return true;
		return false;
		
	},

	remove: function(group){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str == "") {
				group.remove(group.children[i]);
			}	
		}
	},


	checkBackNeedCut: function(furniture){
		var back = furniture.getObjectByName("back");
		var seat = furniture.getObjectByName("seat");
		var center_back = this.getPartCenter(back);
		var center_seat = this.getPartCenter(seat);
		var size_back = this.getPartSize(back);
		var size_seat = this.getPartSize(seat);

		var back_bottom = center_back.y - (size_back.y/2);
		var seat_bottom = center_seat.y - (size_seat.y/2);

		if(back_bottom >= seat_bottom){
			return false;
		}
		else{
			return true;
		}

	},


	findAllChildren: function(array, obj){
	  if(obj.children.length > 0){
	    for (var i = 0; i < obj.children.length; i++) {
	      this.findAllChildren(array, obj.children[i]);
	    }
	  }
	  else
	    array.push(obj);		
	},




	//enable segDistance and segAngle controller
	toggleController: function() {
		
	},

	changeParameterValue: function(pname, value) {
		this.parameters[pname] = value;

		//console.log(this.parameters[pname]);

		this.execute("vertical");


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

		var destVector = new THREE.Vector3(0, refHeight, -3);
		var segVector = new THREE.Vector3(segDistance / 10, 0, 0);
		
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


		//this.addSeat(furnitures, this.reference, this.textures);

	},

	//fip the chair upside down
	flip: function(furnitures) {

		//back up the position
		var destVectors = [];
		for(var i = 0; i < furnitures.length; i++) {
			destVectors.push(furnitures[i].getComponentCenterPosition("seat").clone());
		}

		for(var i = 0; i < furnitures.length; i++) {

			var targetVector = new THREE.Vector3(0, -1, 0);
			furnitures[i].setRotationWithNormalAxis("seat", targetVector);

			//console.log(furnitures[i].normalAxises.back);

			if(i == 0) {
				targetVector = new THREE.Vector3(-1, 0, 0);
			}else if(i == 1) {
				targetVector = new THREE.Vector3(1, 0, 0);
			}
			
			furnitures[i].setRotationWithNormalAxis("back", targetVector);
			furnitures[i].moveToPositionWithComponentCenter(destVectors[i], "seat");
		}
	},


	cut: function(furnitures){
		//cut
		for(var ij = 0; ij < furnitures.length; ij++){

			var furniture = furnitures[ij].getFurniture();
			
			this.checkHasMidFrame(furniture);
			this.checkHasLeg(furniture);

			this.remove(furniture);

			var offset; //very important

			//cut leg
			var legs = new Array();
			var legs_center = new Array();
			var legs_size = new Array();
			for (var i = 0; i < furniture.children.length; i++) {
				if(furniture.children[i].type == "Mesh"){
					if (furniture.children[i].name == "leg") {
						legs.push(furniture.children[i]);

						legs_center.push(this.getPartCenter(furniture.children[i]));
						legs_size.push(this.getPartSize(furniture.children[i]));
					}
				}						
			}

			console.log(furniture);
			
			while(this.hasChildren(legs[0]))
				legs[0] = legs[0].children[0];
			var legMaterial = new THREE.MeshBasicMaterial();
			if (Array.isArray(legs[0].material))
				legMaterial = legs[0].material[0].clone();
			else
				legMaterial = legs[0].material.clone();

			for (var i = 0; i < legs.length; i++) {
				var verticesAttribute = legs[i].geometry.getAttribute('position');
				var verticesArray = verticesAttribute.array;
				var itemSize = verticesAttribute.itemSize;
				var verticesNum = verticesArray.length / itemSize;
				var beforeLength = verticesNum;
				var modifer = new THREE.SimplifyModifier();
				var simplified = modifer.modify( legs[i].geometry,  beforeLength * 0.5 | 0 );
				///console.log(simplified);
				//cut
				offset = furnitures[ij].getComponentCenterPosition('midframe').y - furnitures[ij].getComponentSize('midframe').y;		
				//offset = offset*4.5;
				var cutResultGeometry = chairCutBack(simplified, offset);
				var newleg = new THREE.Mesh( cutResultGeometry, legMaterial );
				furniture.remove(legs[i]);
				furniture.add(newleg);
				
			}

			/*
			//cut back
			var BackNeedCut = this.checkBackNeedCut(furniture);

			var back = furniture.getObjectByName("back");

			if(BackNeedCut){
				var parts = new Array();
				this.findAllChildren(parts, back);
				//console.log(parts);
				var backMaterial = new THREE.MeshBasicMaterial();
				if (Array.isArray(parts[0].material))
					backMaterial = parts[0].material[0].clone();
				else
					backMaterial = parts[0].material.clone();

				var left_part = furnitures[ij].getComponentInName("back", "left");
				var right_part = furnitures[ij].getComponentInName("back", "right");

				//console.log(min + " " + max);
				var center = this.getPartCenter(left_part);
				//var size = this.getPartSize(left_part);
				//offset -= board2_size.y/2; 
				var backGeometry1 = chairCutBack(left_part.geometry, offset);
				var test1 = new THREE.Mesh( backGeometry1, backMaterial );

				back.remove(left_part);
				furniture.add(test1);

				var backGeometry2 = chairCutBack(right_part.geometry, offset);
				var test2 = new THREE.Mesh( backGeometry2, backMaterial );

				back.remove(right_part);
				furniture.add(test2);

			}

			*/
		}
	},

	
	addSeat: function(furnitures, reference, textures) {

		//here the furnitures should be aligned already along x axis

		
		//get the referenced components and their bounding box
		//should be aligned with the components' size, postion and rotations
		//the important part is getting the four cornners of the compoents
		var scope = this;

		if(scope.seat != undefined) {
			scope.main.removeFromScene(this.seat);
		}


		//create the seat object
		var innerRaceCorners2D = [];  //use x and z
		var outerRaceCorners2D = [];

		var offsetY = 0;

		//need further change
		if(this.parameters.ANGLE <= 30)  {

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

		}else if(this.parameters.ANGLE == 180) {

			//1
			var corners_1 = furnitures[0].getCornersByName(reference);

			//corners
			//  1 ----- 2
			//  |       |
			//  |       |
			//  4 --|-- 3
			
			let corner_1_1 = [corners_1[0].x, corners_1[0].z];
			let corner_1_2 = [corners_1[1].x, corners_1[1].z];
			let corner_1_3 = [corners_1[2].x, corners_1[2].z];
			let corner_1_4 = [corners_1[3].x, corners_1[3].z];

			//inner
			innerRaceCorners2D.push(corner_1_1);
			innerRaceCorners2D.push(corner_1_4);
			//outer race
			outerRaceCorners2D.push(corner_1_2);
			outerRaceCorners2D.push(corner_1_3);

			//2
			var corners_2 = furnitures[1].getCornersByName(reference);
			
			let corner_2_1 = [corners_2[0].x, corners_2[0].z];
			let corner_2_2 = [corners_2[1].x, corners_2[1].z];
			let corner_2_3 = [corners_2[2].x, corners_2[2].z];
			let corner_2_4 = [corners_2[3].x, corners_2[3].z];

			//inner
			innerRaceCorners2D.push(corner_2_3);
			innerRaceCorners2D.push(corner_2_2);
			//outer race
			outerRaceCorners2D.push(corner_2_4);
			outerRaceCorners2D.push(corner_2_1);

			offsetY = corners_2[0].y;
		}


		outerRaceCorners2D.reverse();

		//csg make seat
		scope.seat = cadMakeSeat(innerRaceCorners2D, outerRaceCorners2D, offsetY, textures);
		scope.main.scene.add( scope.seat );


	},

	backConnect1: function( furnitures ){
		
		//rotate chair
		furnitures[0].setRotationWithNormalAxis("back", new THREE.Vector3( 1 , 0 , 0 ) );
		furnitures[1].setRotationWithNormalAxis("back", new THREE.Vector3( -1, 0 , 0 ) );

		furnitures[0].setRotationWithNormalAxis("back", new THREE.Vector3( 1 , -1.3 , 0 ) );
		furnitures[1].setRotationWithNormalAxis("back", new THREE.Vector3( -1, -1.3 , 0 ) );
		
		//get funiture
		var f1 = furnitures[0].getFurniture();
		var f2 = furnitures[1].getFurniture();
		//get back
		var f1back = furnitures[0].getComponentByName('seat-back');
		var f2back = furnitures[1].getComponentByName('seat-back');

		//remove leg
		this.Notremove(f1,'seat-back');
		this.Notremove(f2,'seat-back');

		//get back center
		var box = new THREE.Box3();
		var BackCenter = new THREE.Vector3();
		f1BackCenter = new THREE.Vector3();
		f2BackCenter = new THREE.Vector3();
		box.setFromObject(f1back);
		box.getCenter(f1BackCenter);
		box.setFromObject(f2back);
		box.getCenter(f2BackCenter);

		//get back size
		var BackSize = new THREE.Vector3();
		box.getSize(BackSize);
		
		var diff = new THREE.Vector3(f1BackCenter.x - f2BackCenter.x ,
									 f1BackCenter.y - f2BackCenter.y ,
									 f1BackCenter.z - f2BackCenter.z );

		//get chair 2 position
		var f2Position = furnitures[1].getPosition();

		//move chair position
		f2.position.set(f2Position.x + diff.x - BackSize.x,
						f2Position.y + diff.y,
						f2Position.z + diff.z );

		f1.position.set(f1.position.x, f1.position.y-2, f1.position.z);
		f2.position.set(f2.position.x, f2.position.y-2, f2.position.z);

	},

	Notremove: function(group, name){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str != name) {
				group.remove(group.children[i]);
			}	
		}
	},

	backConnect2: function( furnitures ){
		//rotate chair
		furnitures[0].setRotationWithNormalAxis("back", new THREE.Vector3( 1 , 0 , 0 ) );
		furnitures[1].setRotationWithNormalAxis("back", new THREE.Vector3( -1, 0 , 0 ) );

		furnitures[0].setRotationWithNormalAxis("seat", new THREE.Vector3( 0 , 1 , 0 ) );
		furnitures[1].setRotationWithNormalAxis("seat", new THREE.Vector3( 0, -1 , 0 ) );

		//get funiture
		var f1 = furnitures[0].getFurniture();
		var f2 = furnitures[1].getFurniture();
		//remove leg
		this.Notremove(f1,'seat-back');
		this.Notremove(f2,'seat-back');

		//get back
		var f1back = furnitures[0].getComponentByName('seat-back');
		var f2back = furnitures[1].getComponentByName('seat-back');
		//get back center
		var box = new THREE.Box3();
		var BackCenter = new THREE.Vector3();
		var f1BackCenter = new THREE.Vector3();
		var f2BackCenter = new THREE.Vector3();
		box.setFromObject(f1back);
		box.getCenter(f1BackCenter);
		box.setFromObject(f2back);
		box.getCenter(f2BackCenter);

		//get back size
		var BackSize = new THREE.Vector3();
		box.getSize(BackSize);
		//get two back diff position
		var diff = new THREE.Vector3(f1BackCenter.x - f2BackCenter.x ,
									 f1BackCenter.y - f2BackCenter.y ,
									 f1BackCenter.z - f2BackCenter.z );

		//get chair position
		var f1Position = furnitures[0].getPosition();
		var f2Position = furnitures[1].getPosition();

		//move chair position
		f2.position.set(f2Position.x + diff.x ,
						f2Position.y + diff.y - BackSize.y,
						f2Position.z + diff.z );
		
		// creat leg geometry
		var LegGeometry = rebuildMakeLeg ( BackSize.z/20 , BackSize.y );
		var texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
		var newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
		//creat leg model
		var Leg1Model = new THREE.Mesh( LegGeometry, newmaterial );
		var Leg2Model = new THREE.Mesh( LegGeometry, newmaterial );
		this.main.Sceneobjects.push(Leg1Model);
		this.main.Sceneobjects.push(Leg2Model);
		
		//get leg and f2 center
		var LegCenter = new THREE.Vector3();
		box.setFromObject(Leg1Model);
		box.getCenter(LegCenter);
		box.setFromObject(f2);
		box.getCenter(f2BackCenter);
		diff = new THREE.Vector3(f2BackCenter.x - LegCenter.x ,
								 f2BackCenter.y - LegCenter.y ,
								 f2BackCenter.z - LegCenter.z );
		//get leg position
		var Leg1Posit = Leg1Model.position;
		var Leg2Posit = Leg2Model.position;
		//set leg position
		Leg1Model.position.set( Leg1Posit.x + f2BackCenter.x + BackSize.x/3 ,
							    Leg1Posit.y + f2BackCenter.y - BackSize.y/2 ,
							    Leg1Posit.z + f2BackCenter.z + BackSize.z/3);
		Leg2Model.position.set( Leg2Posit.x + f2BackCenter.x + BackSize.x/3 ,
							    Leg2Posit.y + f2BackCenter.y - BackSize.y/2 ,
							    Leg2Posit.z + f2BackCenter.z - BackSize.z/3);


		var scope=this;
		scope.main.scene.add(Leg1Model);
		scope.main.scene.add(Leg2Model);

	}
	

}

module.exports = Chair_Align






