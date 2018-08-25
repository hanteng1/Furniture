"use strict;"

const CabinetMakeSeat = require('./CabinetMakeSeat');
const CabinetMakeBroad = require('./CabinetMakeBroad');
const CabinetMakeBedBroad = require('./CabinetMakeBedBroad');
const rebuildMakeSeat = require('./rebuildMakeSeat');
const MarkSize = require('./MarkSize');
const MarkBetweenSize = require('./MarkBetweenSize');

function Cabinet_kallax (main){

	this.main = main;
	this.furnitures = main.furnitures;
	this.Sceneobjects = main.Sceneobjects;
	this.reference = null;

}

Cabinet_kallax.prototype = {

	execute: function(name){

		if (name == 'chair'){
			this.ToSeat(this.furnitures[0]);
		}
		else if (name == 'table'){
			this.ToTable(this.furnitures);
		}
		else if (name == 'bed'){
			this.SelectBed();
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
		//creat broad 
		var geometry = CabinetMakeBroad( BroadSize.x , BroadSize.y , BroadSize.z );
		var texture = new THREE.TextureLoader().load( 'images/material/material5.jpg' );
		texture.repeat.set(0.1, 0.1);
		texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewBroad = new THREE.Mesh( geometry, newmaterial );
		//set broad position
		NewBroad.position.set(BroadPosi.x , BroadPosi.y , BroadPosi.z);
		this.main.Sceneobjects.push(NewBroad);
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
		this.loadModel( ModelPath , 0 , posi , furniture);

		posi = new THREE.Vector3( fCenter.x ,
								  fCenter.y + fSize.y/2 , 
								  fCenter.z + fSize.z/2 );
		this.loadModel( ModelPath , 90 , posi , furniture);

		posi = new THREE.Vector3( fCenter.x + fSize.x/2 ,
								  fCenter.y + fSize.y/2, 
								  fCenter.z );
		this.loadModel( ModelPath , 180 , posi , furniture);

		posi = new THREE.Vector3( fCenter.x ,
								  fCenter.y + fSize.y/2 , 
								  fCenter.z - fSize.z/2 );
		this.loadModel( ModelPath , 270 , posi , furniture);

	},
	loadModel: function( ModelPath , angle , Posi , group ){
		
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
			
		} );
	},

	SelectBed: function(){
		var mode = '';
		var main = this;
		$( ".item.ui.image.label.twin_bed" ).click(function() {
			
			if (mode != 'twin' ){
				mode = 'twin';
				main.reset();
				main.ToBed( main.furnitures , mode );
			}

		});
		$( ".item.ui.image.label.queen_bed" ).click(function() {
			
			if (mode != 'queen' ){
				mode = 'queen';
				main.reset();
				main.ToBed( main.furnitures , mode );
			}

		});

	}, 

	ToBed: function(furnitures , mode){

		var scope = this;
		var funiture1 = furnitures[0].getFurniture();
		var funiture2 = furnitures[1].getFurniture();

		//get funiture position
		var f1Posi = new THREE.Vector3(funiture1.position.x ,
									   funiture1.position.y ,
									   funiture1.position.z);

		var f2Posi = new THREE.Vector3(funiture2.position.x ,
									   funiture2.position.y ,
									   funiture2.position.z);
		//get funiture size
		var fSize = furnitures[0].getSize();
		//set funiture2 position
		funiture2.position.set(funiture1.position.x + fSize.x, 
							   funiture2.position.y ,
							   funiture1.position.z);
		//get funiture center
		var f1Center = furnitures[0].getFurnitureCenter();
		var f2Center = furnitures[1].getFurnitureCenter();
		var BroadSize = new THREE.Vector3();
		var BroadPosi = new THREE.Vector3();

		if (mode == "queen"){
			//set bed width
			if ( (Math.abs(f1Center.x - f2Center.x)+ fSize.x ) < 60 ){
				var i=1
				while ((Math.abs(f1Center.x - f2Center.x) + fSize.x ) < 60) {
					funiture2.position.set(funiture2.position.x + i, 
								   		   funiture2.position.y ,
										   funiture1.position.z  );
					//get funiture center
					f1Center = furnitures[0].getFurnitureCenter();
					f2Center = furnitures[1].getFurnitureCenter();
				}
			}
			//get broad size
			BroadSize = new THREE.Vector3( Math.abs(f1Center.x - f2Center.x)+fSize.x , 
										   0.5 ,  
										   Math.abs(f1Center.z - f2Center.z)+fSize.z );
			//get broad position
			BroadPosi = new THREE.Vector3( (f1Center.x + f2Center.x)/2 - BroadSize.x/2,
											f1Center.y + fSize.y/2 ,
										   (f1Center.z + f2Center.z)/2 - BroadSize.z/2);
			this.loadQueenBed(f1Center , f2Center , BroadSize , BroadPosi);

			
		}
		else if (mode == "twin"){
			if ( (Math.abs(f1Center.x - f2Center.x)+ fSize.x ) < 44 ){
				var i=1
				while ((Math.abs(f1Center.x - f2Center.x) + fSize.x ) < 44) {
					funiture2.position.set(funiture2.position.x + i, 
								   		   funiture2.position.y ,
										   funiture1.position.z  );
					//get funiture center
					f1Center = furnitures[0].getFurnitureCenter();
					f2Center = furnitures[1].getFurnitureCenter();
				}
			}
			//get broad size
			BroadSize = new THREE.Vector3( Math.abs(f1Center.x - f2Center.x)+fSize.x , 
										   0.5 ,  
										   Math.abs(f1Center.z - f2Center.z)+fSize.z );
			//get broad position
			BroadPosi = new THREE.Vector3( (f1Center.x + f2Center.x)/2 - BroadSize.x/2,
											f1Center.y + fSize.y/2 ,
										   (f1Center.z + f2Center.z)/2 - BroadSize.z/2);
			this.loadTwinBed(f1Center , f2Center , BroadSize , BroadPosi);
		}

		
		var geometry = CabinetMakeBedBroad( BroadSize.x , BroadSize.y , BroadSize.z );
		var texture = new THREE.TextureLoader().load( 'images/material/material8.jpg' );
		texture.repeat.set(0.1, 0.1);
		texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewBroad = new THREE.Mesh( geometry, newmaterial );

		NewBroad.position.set(BroadPosi.x , BroadPosi.y , BroadPosi.z);

		//show broad
		scope.main.scene.add(NewBroad);
		scope.main.Sceneobjects.push(NewBroad);
		//creat other 4 broads
		if (mode == "queen" && fSize.z < 81-(BroadSize.y+1)){
			//set texture info
			texture = new THREE.TextureLoader().load( 'images/material/material5.jpg' );
			texture.repeat.set(0.1, 0.1);
			texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
			newmaterial = new THREE.MeshBasicMaterial( {map: texture} );

			//creat broad 
			geometry = CabinetMakeBroad( BroadSize.x , BroadSize.y + 1 , 81 - BroadSize.z );			
			Broad1 = new THREE.Mesh( geometry, newmaterial );
			Broad2 = new THREE.Mesh( geometry, newmaterial );
			
			geometry = CabinetMakeBroad( BroadSize.x , fSize.y - (BroadSize.y+1)*2 +0.5 , BroadSize.y + 1 );
			Broad3 = new THREE.Mesh( geometry, newmaterial );
			Broad4 = new THREE.Mesh( geometry, newmaterial );

			//set broad position
			Broad1.position.set(BroadPosi.x , BroadPosi.y - 1, BroadPosi.z - (81 - BroadSize.z) );
			Broad2.position.set(BroadPosi.x , 0				 , BroadPosi.z - (81 - BroadSize.z) );
			Broad3.position.set(BroadPosi.x , BroadSize.y + 1, BroadPosi.z - (81 - BroadSize.z) );
			Broad4.position.set(BroadPosi.x , BroadSize.y + 1, BroadPosi.z - (BroadSize.y + 1) );
			
		}
		else if (mode == "twin" && fSize.z < 75-(BroadSize.y+1) ){
			//set texture info
			texture = new THREE.TextureLoader().load( 'images/material/material5.jpg' );
			texture.repeat.set(0.1, 0.1);
			texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
			newmaterial = new THREE.MeshBasicMaterial( {map: texture} );

			//creat broad 
			geometry = CabinetMakeBroad( BroadSize.x , BroadSize.y + 1 , 75 - BroadSize.z );			
			Broad1 = new THREE.Mesh( geometry, newmaterial );
			Broad2 = new THREE.Mesh( geometry, newmaterial );
			
			geometry = CabinetMakeBroad( BroadSize.x , fSize.y - (BroadSize.y+1)*2 +0.5 , BroadSize.y + 1 );
			Broad3 = new THREE.Mesh( geometry, newmaterial );
			Broad4 = new THREE.Mesh( geometry, newmaterial );

			//set broad position
			Broad1.position.set(BroadPosi.x , BroadPosi.y - 1, BroadPosi.z - (75 - BroadSize.z) );
			Broad2.position.set(BroadPosi.x , 0				 , BroadPosi.z - (75 - BroadSize.z) );
			Broad3.position.set(BroadPosi.x , BroadSize.y + 1, BroadPosi.z - (75 - BroadSize.z) );
			Broad4.position.set(BroadPosi.x , BroadSize.y + 1, BroadPosi.z - (BroadSize.y + 1) );

		}
		
		var group = new THREE.Group();
		group.add( Broad1 );
		group.add( Broad2 );
		group.add( Broad3 );
		group.add( Broad4 );
		scope.main.scene.add(group);
		scope.main.Sceneobjects.push(group);


	},

	loadQueenBed: function( f1Center , f2Center , BroadSize , BroadPosi ){
		var ModelPath = '../models/mattress_queen.dae';
		var scope=this;
		var Model;
		
		// loading manager
		var loadingManager = new THREE.LoadingManager( function() {} );
		
		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( ModelPath , function ( collada ) {
			
			Model = collada.scene;

			scope.main.scene.add(Model);
			scope.main.Sceneobjects.push(Model);
			Model.scale.set(40,40,40);
			Model.rotateOnWorldAxis(new THREE.Vector3(0,1,0) , 90 * Math.PI/180);

			
			var box 		= new THREE.Box3();
			var bedCenter	= new THREE.Vector3( ( f1Center.x + f2Center.x )/2 ,
												 ( f1Center.y + f2Center.y )/2 ,
												 ( f1Center.z + f2Center.z )/2 );

			Model.position.set( bedCenter.x + BroadSize.x/2, 
								BroadPosi.y + 0.5 , 
								bedCenter.z + BroadSize.z/2);
		} );
	},

	loadTwinBed: function(f1Center , f2Center , BroadSize , BroadPosi){
		var ModelPath = '../models/mattress_twin.dae';
		var scope=this;
		var Model;
		
		// loading manager
		var loadingManager = new THREE.LoadingManager( function() {} );
		
		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( ModelPath , function ( collada ) {
			
			Model = collada.scene;
			scope.main.Sceneobjects.push(Model);
			scope.main.scene.add(Model);
			Model.scale.set(40,40,40);
			Model.rotateOnWorldAxis(new THREE.Vector3(0,1,0) , 90 * Math.PI/180);

			var box 		= new THREE.Box3();
			var bedCenter	= new THREE.Vector3( ( f1Center.x + f2Center.x )/2 ,
												 ( f1Center.y + f2Center.y )/2 ,
												 ( f1Center.z + f2Center.z )/2 );
			Model.position.set( bedCenter.x + BroadSize.x/2, 
								BroadPosi.y + 0.5 , 
								bedCenter.z + BroadSize.z/2);
			
		});
	},

	reset: function(){

		var main = this.main;

		//clean the scene and copy back the furnitures from the dataset
		for(var i = main.scene.children.length - 1; i > -1; i -- ){ 
			var object =  main.scene.children[i];	
			
			if(object.isObject3D){

				if ( object instanceof THREE.Camera ) {

				} else if ( object instanceof THREE.PointLight ) {

				} else if ( object instanceof THREE.DirectionalLight ) {

				} else if ( object instanceof THREE.SpotLight ) {					

				} else if ( object instanceof THREE.HemisphereLight ) {

				}else if ( object instanceof THREE.AmbientLight ) {

				}else if ( object instanceof THREE.GridHelper ) {

				}else if ( object instanceof THREE.TransformControls ){

				}else if( object instanceof AddAxis){

				}else if( object instanceof THREE.BoxHelper){

				}else{
					main.removeFromScene(object); 
				}
			}
		}

		main.furnitures.length = 0;	

		//add the furnitures and their cards
		for(var j = 0; j < main.furnituresDataSet.length; j ++) {
			var furniture = main.furnituresDataSet[j];
			var new_furnitureObj = new THREE.Object3D();
			new_furnitureObj.copy(furniture.getFurniture(), true);
			var new_furniture = new Furniture(new_furnitureObj);

			new_furniture.setCategory("straight_chair");
			new_furniture.setIndex(furniture.index);
			main.furnitures.push(new_furniture);

			main.scene.add(new_furniture.getFurniture());

			//copy the state
			new_furniture.updatePosition(furniture.position);
			new_furniture.updateDirection();
			new_furniture.updateQuaternion(furniture.quaternion);

			//copy the components and labeled state
			new_furniture.updateListedComponents(furniture.listedComponents);
			new_furniture.updateLabeledComponents(furniture.labeledComponents);

			//copy the already labeled normal axis
			//Object.assign(new_furniture.normalAxises, furniture.normalAxises);
			for (let key in furniture.normalAxises) {
				new_furniture.normalAxises[key] = new THREE.Vector3();
				new_furniture.normalAxises[key].copy(furniture.normalAxises[key]);
			}
		}

		for(var i = main.selectionBoxes.length-1; i >-1 ; i--)
		{
			main.removeFromScene(main.selectionBoxes[i]);
		}
		main.Sceneobjects=[];

	},

	loadText: function( text , position , rotat ){

		var main = this.main;

		var loader = new THREE.FontLoader();
		var font = loader.load(
			// resource URL
			'three.js-master/examples/fonts/helvetiker_regular.typeface.json',

			// onLoad callback
			function ( font ) {
				var geometry = new THREE.TextGeometry( text , {
					font: font ,
					size: 1,
					height: 0.05,
					curveSegments: 12,
					bevelEnabled: false,
					bevelThickness: 5,
					bevelSize: 4,
					bevelSegments: 1
				} );

				var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
				var mesh = new THREE.Mesh( geometry, material );

				mesh.position.set( position.x , position.y +0.5 , position.z );
				mesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0) , rotat * Math.PI/180);
				main.scene.add( mesh );
			}
		);
		
	},

	loadLine: function(point1 , point2){

		var material = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 10,
			linecap: 'round', //ignored by WebGLRenderer
			linejoin:  'round' //ignored by WebGLRenderer
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( point1.x , point1.y , point1.z ),
			new THREE.Vector3( point2.x , point2.y , point2.z )
		);

		var line = new THREE.Line( geometry, material );
		this.main.scene.add( line );

	}



}

module.exports = Cabinet_kallax