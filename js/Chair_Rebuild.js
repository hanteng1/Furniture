"use strict;"

const rebuildMakeSeat = require('./rebuildMakeSeat');
const rebuildMakeLeg = require('./rebuildMakeLeg');
const computeConvexHull = require('./computeConvexHull');
const cadExtrudeShape = require('./cadExtrudeShape');
const chairCutBack = require('./chairCutBack');
const Model_wrap = require('./Model_wrap');
const Model_Painting = require('./Model_Painting');

function Chair_Rebuild (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;

	this.textures = {};

	this.init();
}


Chair_Rebuild.prototype = {


	init: function() {

		var manager = new THREE.LoadingManager();
	    manager.onProgress = function ( item, loaded, total ) {
	        console.log( item, loaded, total );
	    };

	    var textureLoader = new THREE.TextureLoader( manager );
	    
	    this.textures["material1"] = textureLoader.load( '../images/linen_cloth.jpg' );
	    this.textures["material1"].repeat.set(0.1, 0.1);
		this.textures["material1"].wrapS = this.textures["material1"].wrapT = THREE.MirroredRepeatWrapping;

		this.textures["material2"] = textureLoader.load( '../images/material/material2.jpg' );
	    this.textures["material2"].repeat.set(0.1, 0.1);
		this.textures["material2"].wrapS = this.textures["material2"].wrapT = THREE.MirroredRepeatWrapping;

		this.textures["material3"] = textureLoader.load( '../images/material/material4.jpg' );
	    this.textures["material3"].repeat.set(0.1, 0.1);
		this.textures["material3"].wrapS = this.textures["material3"].wrapT = THREE.MirroredRepeatWrapping;

		this.textures["material4"] = textureLoader.load( '../images/material/material5.jpg' );
	    this.textures["material4"].repeat.set(0.1, 0.1);
		this.textures["material4"].wrapS = this.textures["material4"].wrapT = THREE.MirroredRepeatWrapping;

	},

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

		console.log(name);

		if(name == 'seat'){
			this.changeTexture(this.furnitures[0]);
		}
		else if(name == 'leg'){
			this.ChangeLeg(this.furnitures[0]);
		}
		else if(name == 'back'){
			//this.backConnect1(this.furnitures);
			//this.backConnect2(this.furnitures);
		}else if(name == 'backrest') {
			this.addBackRest(this.furnitures[0]);
		}

	},


	addBackRest: function(furniture) {

		console.log("function called");

		//get back and its contour
		var back_left = furniture.getComponentInName("back", "left");
		var back_left_points = computeConvexHull(back_left, "yz"); //2d points

		//get the points above the seat
		var seatHeight = furniture.getComponentCenterPosition("seat").y + furniture.getComponentSize("seat").y / 2;
		var corrected_back_left_points = [];
		for(var i = 0; i < back_left_points.length - 1; i++) {
			var point_1 = back_left_points[i];
			var point_2 = back_left_points[i + 1];

			if( point_1[0] > seatHeight && point_2[0] > seatHeight){
				if(!corrected_back_left_points.includes(point_1)) {
					corrected_back_left_points.push(point_1);
				}

				if(!corrected_back_left_points.includes(point_2)) {
					corrected_back_left_points.push(point_2);
				}
			}else if(point_1[0] > seatHeight && point_2[0] < seatHeight){
				if(!corrected_back_left_points.includes(point_1)) {
					corrected_back_left_points.push(point_1);
				}

				//make a point
				var addPointY = seatHeight;
				var addPointZ = point_2[1] + ((addPointY - point_2[0]) / (point_1[0] - point_2[0])) * (point_1[1] - point_2[1]);
				corrected_back_left_points.push([addPointY, addPointZ]);

			}else if(point_1[0] < seatHeight && point_2[0] > seatHeight){
				//make a point
				var addPointY = seatHeight;
				var addPointZ = point_1[1] + ((addPointY - point_1[0]) / (point_2[0] - point_1[0])) * (point_2[1] - point_1[1]);
				corrected_back_left_points.push([addPointY, addPointZ]);

				if(!corrected_back_left_points.includes(point_2)) {
					corrected_back_left_points.push(point_2);
				}
			}

		}


		//make it 3d
		var x_pos = furniture.getComponentCenterPosition("back").x - furniture.getComponentSize("back").x / 2;		

		var back_left_3d = [];
		for(var i = 0; i < corrected_back_left_points.length; i++) {
			var point = corrected_back_left_points[i];
			back_left_3d.push([x_pos, point[0], point[1]]);
		}



		// //visualize
		// var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
		// var back_left_geometry = new THREE.Geometry();

		// for(var i =0; i < back_left_points.length; i++) {
		// 	var point = back_left_points[i];
		// 	var tempP = new THREE.Vector3(x_pos, point[0], point[1]);
		// 	back_left_geometry.vertices.push(tempP);
		// }

		// var back_left_line = new THREE.Line( back_left_geometry, material );

		// this.main.scene.add( back_left_line );

		//get top and its contour
		var back_whole = furniture.getComponentByName("back");
		var back_whole_points = computeConvexHull(back_whole, "xy"); //2d points

		var z_pos = furniture.getComponentCenterPosition("back").z - furniture.getComponentSize("back").z / 2;

		// var back_whole_geometry = new THREE.Geometry();

		// for(var i =0; i < back_whole_points.length; i++) {
		// 	var point = back_whole_points[i];
		// 	var tempP = new THREE.Vector3(point[0], point[1], z_pos);
		// 	back_whole_geometry.vertices.push(tempP);
		// }

		// var back_whole_line = new THREE.Line( back_whole_geometry, material );
		// this.main.scene.add( back_whole_line );

		//get back top line ,, based on the vector directions and clockwise
		//assumption. sull returns points with the point at the top-right (largest x and largest y)
		var back_top_points = [];  //2d points for now
		var angle_offset = 20;
		var test_begin = false;
		for(var i = 0; i < back_whole_points.length - 1; i ++) {
			var point_1 = back_whole_points[i];
			var point_2 = back_whole_points[i + 1];

			var test_vector = new THREE.Vector2(back_whole_points[i + 1][0] - back_whole_points[i][0], 
												back_whole_points[i + 1][1] - back_whole_points[i][1]);
			
			//console.log(test_vector);
			var test_angle = test_vector.angle() * 180 / Math.PI;

			//console.log(test_angle);

			if(test_angle > 180 - angle_offset && test_angle < 180 + angle_offset)
			{
				test_begin = true;
				if(!back_top_points.includes(point_1)){
					back_top_points.push(point_1);
				}

				if(!back_top_points.includes(point_2)) {
					back_top_points.push(point_2);
				}
			}else{
				//todo.. this may not always working
				if(test_begin == true){
					break;
				}	
			}
		}

		// console.log(back_top_points);


		var back_extrude_3d = [];
		for(var i = 0; i < back_top_points.length; i++) {
			var point = back_top_points[i];
			back_extrude_3d.push([point[0], point[1], z_pos]);
		}

		//generate shape
		var geometry = cadExtrudeShape(back_left_3d, back_extrude_3d);
		var texture = this.textures["material1"];
		var material = new THREE.MeshBasicMaterial( {map: texture} );

		var backRest = new THREE.Mesh( geometry, material );

		this.main.scene.add( backRest );

	},


	changeTexture: function(furniture){
		$('#parameter_control_chair_rebuild').show();
		var group = furniture.getFurniture();
		var seat = furniture.getComponentByName('seat');
		var SeatSize = furniture.getComponentSize('seat');
		var SeatPosi = furniture.getComponentCenterPosition('seat');

		var group = furniture.getFurniture();
		var mode = "NormalSeat"
		var texture = this.textures["material1"];
		var main = this;
		//main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
		console.log(seat);
		Model_Painting( seat , texture);

		$( ".item.ui.image.label.1" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				SeatPosi = furniture.getComponentCenterPosition('seat');
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = main.textures["material1"];
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
			texture = main.textures["material2"];
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
			texture = main.textures["material3"];
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
			texture = main.textures["material4"];
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
			texture = main.textures["material4"];
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
		//NewSeatPosi = NewSeat.position;
		
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
		//this.remove(group,'stand');
		this.cut(furniture);


		//load new leg
		this.loadLegModel('../models/Legs/Leg1.dae', furniture, SeatPosi, SeatSize);
		
	},


	remove: function(group){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str == "") {
				group.remove(group.children[i]);
			}	
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
				//console.log(array[i]);
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


	findAllChildren: function(array, obj){
	  if(obj.children.length > 0){
	    for (var i = 0; i < obj.children.length; i++) {
	      this.findAllChildren(array, obj.children[i]);
	    }
	  }
	  else
	    array.push(obj);		
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

	cut: function(furObj){

		var furniture = furObj.getFurniture();

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
			offset = furObj.getComponentCenterPosition('midframe').y - furObj.getComponentSize('midframe').y;		
			offset = offset*4.5;
			var cutResultGeometry = chairCutBack(simplified, offset);
			var newleg = new THREE.Mesh( cutResultGeometry, legMaterial );
			furniture.remove(legs[i]);
			furniture.add(newleg);
			
		}

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

			var left_part = furObj.getComponentInName("back", "left");
			var right_part = furObj.getComponentInName("back", "right");

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
			scope.main.Sceneobjects.push(LegModel);
			LegModel.name = 'stand';
			LegModel.scale.set(2.5,2.5,2.5);

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

			LegPosi = new THREE.Vector3(LegModel.position.x,
										LegModel.position.y,
										LegModel.position.z);
			
			//calculate the leg inverse metrix
			var inverseMatrix = new THREE.Matrix4();
			inverseMatrix.getInverse(group.matrixWorld, true);
			LegModel.applyMatrix(inverseMatrix);

			//add new leg to original model
			group.worldToLocal(LegPosi);
			box.setFromObject(LegModel);
			box.getCenter(LegCenter);
			

			group.add(LegModel);
			LegModel.position.set(LegPosi.x , LegPosi.y, LegPosi.z);

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

		//get chair 2 position
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
module.exports = Chair_Rebuild
