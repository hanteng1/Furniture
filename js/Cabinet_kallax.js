"use strict;"

const CabinetMakeSeat = require('./CabinetMakeSeat');
const CabinetMakeBroad = require('./CabinetMakeBroad');

function Cabinet_kallax (main){

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;

}

Cabinet_kallax.prototype = {

	execute: function(name){

		if (name == 'seat'){
			this.ToSeat(this.furnitures[0]);
		}
		else if (name == 'table'){
			this.ToTable(this.furnitures);
		}

	},

	ToSeat: function(furniture){
		//get cabinet 
		var group = furniture.getFurniture();

		//rotate cabinet
		furniture.setRotationWithNormalAxis("cabinetTop", new THREE.Vector3( -1 , 0 , 0 ) );
		
		//get cabinet outside info
		var box 		= new THREE.Box3();
		var CabiCenter  = new THREE.Vector3();
		var CabiSize 	= new THREE.Vector3();
		box.setFromObject(group);
		box.getCenter(CabiCenter);
		box.getSize(CabiSize);
		
		//creat seat
		var geometry = CabinetMakeSeat( CabiSize.x , CabiSize.z );
		var texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var Seat = new THREE.Mesh( geometry, newmaterial );
		Seat.name = 'seat';

		var seatCenter = new THREE.Vector3();
		box.setFromObject(Seat);
		box.getCenter(seatCenter);

		var diff = new THREE.Vector3( CabiCenter.x - seatCenter.x ,
									  CabiCenter.y - seatCenter.y ,
									  CabiCenter.z - seatCenter.z );
		
		var SeatPosi = new THREE.Vector3(Seat.position.x ,
										 Seat.position.y ,
										 Seat.position.z );
		//put seat on cabinet top
		Seat.position.set(SeatPosi.x + diff.x , 
						  SeatPosi.y + diff.y + CabiSize.y/2,
						  SeatPosi.z + diff.z );

		var newSeatPosi = new THREE.Vector3(Seat.position.x ,
											Seat.position.y ,
											Seat.position.z );
		
		//calculate inverse metrix
		var inverseMatrix = new THREE.Matrix4();
		inverseMatrix.getInverse(group.matrixWorld, true);
		Seat.applyMatrix(inverseMatrix);
		//add to cabinet group
		group.worldToLocal(newSeatPosi);
		group.add(Seat);
		Seat.position.set(newSeatPosi.x , 
						  newSeatPosi.y ,
						  newSeatPosi.z );

	},
	ToTable: function(furnitures){

		var funiture1 = furnitures[0].getFurniture();
		var funiture2 = furnitures[1].getFurniture();
		//get funiture position
		var f1Posi = new THREE.Vector3(funiture1.position.x , 
									   funiture1.position.y ,
									   funiture1.position.z);
		var f2Posi = new THREE.Vector3(funiture2.position.x , 
									   funiture2.position.y ,
									   funiture2.position.z);
		//set funiture2 position
		funiture2.position.set(funiture2.position.x , 
							   funiture2.position.y ,
							   funiture1.position.z);
		//get funiture center 
		var f1Center = furnitures[0].getFurnitureCenter();
		var f2Center = furnitures[1].getFurnitureCenter();
		//get funiture size 
		var f1Size = furnitures[0].getSize();
		var f2Size = furnitures[1].getSize();
		//get broad size
		var BroadSize = new THREE.Vector3( Math.abs(f1Center.x - f2Center.x)+f1Size.x +3 , 
										 	1 ,  
										   Math.abs(f1Center.z - f2Center.z)+f2Size.z +3 );
		//get broad position
		var BroadPosi = new THREE.Vector3( (f1Center.x + f2Center.x)/2 - BroadSize.x/2,
											f1Center.y + f1Size.y/2    ,
										   (f1Center.z + f2Center.z)/2 - BroadSize.z/2);

		var geometry = CabinetMakeBroad( BroadSize.x , BroadSize.y , BroadSize.z );
		var texture = new THREE.TextureLoader().load( 'images/material/material7.jpg' );
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewBroad = new THREE.Mesh( geometry, newmaterial );

		NewBroad.position.set(BroadPosi.x , BroadPosi.y , BroadPosi.z);

		//show broad
		var scope = this;
		scope.main.scene.add(NewBroad);

		var AnglePosi = new THREE.Vector3(0,0,0);

		this.addAngle(  furnitures[0] );
		this.addAngle(  furnitures[1] );


	},
	addAngle: function(furnitures){
		var ModelPath = '../models/angle.dae';
		var furniture = furnitures.getFurniture();
		var fPosi = new THREE.Vector3(furniture.position.x ,
									  furniture.position.y ,
									  furniture.position.z);
		var fCenter = furnitures.getFurnitureCenter();
		var fSize = furnitures.getSize();
		var posi = new THREE.Vector3();

		posi = new THREE.Vector3( fCenter.x - fSize.x/2 ,
								  fCenter.y + fSize.y/2, 
								  fCenter.z );
		this.loadModel( ModelPath , 0 , posi);

		posi = new THREE.Vector3( fCenter.x ,
								  fCenter.y + fSize.y/2 , 
								  fCenter.z + fSize.z/2 );
		this.loadModel( ModelPath , 90 , posi);

		posi = new THREE.Vector3( fCenter.x + fSize.x/2 ,
								  fCenter.y + fSize.y/2, 
								  fCenter.z );
		this.loadModel( ModelPath , 180 , posi);

		posi = new THREE.Vector3( fCenter.x ,
								  fCenter.y + fSize.y/2 , 
								  fCenter.z - fSize.z/2 );
		this.loadModel( ModelPath , 270 , posi);

	},
	loadModel: function( ModelPath , angle , Posi ){
		
		var scope=this;
		var Model;
		
		// loading manager
		var loadingManager = new THREE.LoadingManager( function() {} );
		
		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( ModelPath , function ( collada ) {
			
			Model = collada.scene;

			scope.main.scene.add(Model);
			Model.scale.set(1,1,1);

			Model.rotateOnWorldAxis(new THREE.Vector3(0,0,1) , 180 * Math.PI/180);
			Model.rotateOnWorldAxis(new THREE.Vector3(0,1,0) , angle * Math.PI/180);
			
			Model.name = 'angle';
			
			Model.position.set( Posi.x , Posi.y , Posi.z );
			console.log(Posi);
		} );
	}


}

module.exports = Cabinet_kallax