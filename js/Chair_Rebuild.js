"use strict;"

const rebuildMakeSeat = require('./rebuildMakeSeat');
const rebuildMakeLeg = require('./rebuildMakeLeg');

function Chair_Rebuild (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;

}


Chair_Rebuild.prototype = {


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
	execute: function(name){

		if(name == 'seat'){
			this.changeTexture(this.furnitures[0]);
		}
		else if(name == 'leg'){
			this.ChangeLeg(this.furnitures[0]);
		}
		else if(name == 'back'){
			//this.backConnect1(this.furnitures);
			this.backConnect2(this.furnitures);
		}

	},
	changeTexture: function(furniture){
		$('#parameter_control_chair_rebuild').show();
		var group = furniture.getFurniture();
		var seat = furniture.getComponentByName('seat');
		var SeatSize = furniture.getComponentSize('seat');
		var SeatPosi = furniture.getComponentCenterPosition('seat');


		var group = furniture.getFurniture();
		var mode = "NormalSeat"
		var texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
		var main = this;
		main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
		

		$( ".item.ui.image.label.1" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				SeatPosi = furniture.getComponentCenterPosition('seat');
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.2" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				SeatPosi = furniture.getComponentCenterPosition('seat');
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.3" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				SeatPosi = furniture.getComponentCenterPosition('seat');
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material3.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.4" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				SeatPosi = furniture.getComponentCenterPosition('seat');
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material4.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".align.justify.icon.1" ).click(function() {
			//change seat
			if (mode == "NormalSeat"){
				mode = "ThinBoard";
				SeatPosi = furniture.getComponentCenterPosition('seat');
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);

			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
			
		});

	},

	changeseatmodel: function(furniture,NewSeatSize,NewSeatPosi, texture, mode){
		//get the furniture
		var group = furniture.getFurniture();
		var seat = furniture.getComponentByName('seat');
		group.remove(seat);

		geometry = rebuildMakeSeat( NewSeatSize.x , NewSeatSize.y , NewSeatSize.z , mode);
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewSeat = new THREE.Mesh( geometry, newmaterial );
		NewSeat.name = 'seat';

		
		NewSeat.position.set(NewSeatPosi.x - NewSeatSize.x/2,
							 NewSeatPosi.y - NewSeatSize.y/2,
							 NewSeatPosi.z - NewSeatSize.z/2);
		var SeatPosi = new THREE.Vector3(NewSeat.position.x ,
										 NewSeat.position.y ,
										 NewSeat.position.z);
		NewSeatPosi = NewSeat.position;
		
		var inverseMatrix = new THREE.Matrix4();
		inverseMatrix.getInverse(group.matrixWorld, true);
		NewSeat.applyMatrix(inverseMatrix);
		
		group.worldToLocal(SeatPosi);
		group.add(NewSeat);
		NewSeat.position.set(SeatPosi.x , 
							 SeatPosi.y ,
							 SeatPosi.z );
		
	},
	ChangeLeg: function(furniture){
		//get the furniture group
		var group = furniture.getFurniture();

		//get seat size
		var SeatSize = furniture.getComponentSize('seat');
		var SeatPosi = furniture.getComponentCenterPosition('seat');

		//remove leg
		this.remove(group,'stand');

		//load new leg
		this.loadLegModel('../models/Legs/Leg2.dae', furniture, SeatPosi, SeatSize);
		
	},

	remove: function(group, name){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str == name) {
				group.remove(group.children[i]);
			}	
		}
	},
	
	loadLegModel: function( ModelPath, furniture, SeatPosi, SeatSize ){
		
		var group = furniture.getFurniture();
		var scope=this;
		var LegModel;
		
		// loading manager
		var loadingManager = new THREE.LoadingManager( function() {} );
		
		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( ModelPath , function ( collada ) {
			
			LegModel = collada.scene;
			scope.main.scene.add(LegModel);

			LegModel.name = 'stand';
			LegModel.scale.set(9,9,9);

			var box = new THREE.Box3();
			box.setFromObject(LegModel);
			var LegCenter = new THREE.Vector3();
			box.getCenter(LegCenter);

			var diff = new THREE.Vector3( SeatPosi.x - LegCenter.x ,
									  	  SeatPosi.y - LegCenter.y ,
									  	  SeatPosi.z - LegCenter.z );
			
			var LegPosi = LegModel.position;
			LegModel.position.set(LegPosi.x + diff.x  ,
								  LegPosi.y + diff.y - LegCenter.y ,
								  LegPosi.z + diff.z );

			LegPosi = LegModel.position;
			
			//calculate the leg inverse metrix
			var inverseMatrix = new THREE.Matrix4();
			inverseMatrix.getInverse(group.matrixWorld, true);
			LegModel.applyMatrix(inverseMatrix);

			//add new leg to original model
			//group.worldToLocal(LegPosi);
			box.setFromObject(LegModel);
			box.getCenter(LegCenter);

			LegModel.position.set( LegPosi.x - LegCenter.x - SeatSize.x/2 , 
								   LegPosi.y - LegCenter.y + SeatSize.z/2 , 
								   SeatPosi.y - LegCenter.z*2);
			
			group.add(LegModel);
			

		} );
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

		//get chair position
		var f1Position = furnitures[0].getPosition();
		var f2Position = furnitures[1].getPosition();

		//move chair position
		f2.position.set(f2Position.x + diff.x - BackSize.x,
						f2Position.y + diff.y,
						f2Position.z + diff.z );

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
module.exports = Chair_Rebuild
