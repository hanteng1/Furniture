const chairCreateBoard = require('./chairCreateBoard')
const chairCutBack = require('./chairCutBack')

function Chair_Add (main) {
 	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed

	this.parameters = {
		CHAIR_ADD_POSITION: 0,
		CHAIR_ADD_WIDTH: 0, 
		CHAIR_ADD_HEIGHT: 0
	};

	//number of furnitures
	var count = 0;

	var hasBoard = false;
	var hasHook = false;
	var hasFlip = false;
}


Chair_Add.prototype = {

//--------------------------------------------------------------------------------------------
	init : function() {
		this.hasBoard = false;
		this.hasHook = false;
		this.hasFlip = false;
	},
//--------------------------------------------------------------------------------------------

	checkHasSeat: function(furniture) {		
		return furniture.hasComponent('seat');
	},

	checkHasBack: function(furniture) {		
		return furniture.hasComponent('back');
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
			if (str != "back" && str != "seat") {
				array.push(furniture.children[i]);
				array_centerPosition.push(this.getPartCenter(furniture.children[i]));
				array_size.push(this.getPartSize(furniture.children[i]));
			}
		}

		var checkPoint = seat_centr.y - seat_size.y/2;
		for (var i = 0; i < array.length; i++) {
			var point = array_centerPosition[i].y;
			if(point <= checkPoint && point >= checkPoint - 2)
				array[i].name = "midframe";
		}
	},

	checkNeedCut: function(furniture){
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
	
	changeParameterValue: function(pname, value) {
		this.parameters[pname] = value;
		this.execute();
	},

	computeNumber: function (value) {		
		if (value < 0)
	        return Math.ceil(value);
	    else
	    	return Math.floor(value);
	},	

	remove: function(group, name){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str != name) {
				group.remove(group.children[i]);
			}	
		}
	},

	remove2: function(group, name1, name2){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str != name1 && str != name2) {
				group.remove(group.children[i]);
			}	
		}
	},

	remove3: function(group, name1, name2, name3){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str != name1 && str != name2 && str != name3) {
				group.remove(group.children[i]);
			}	
		}
	},

	hasChildren: function(obj){
		if (obj.children.length != 0)
			return true;
		return false;
		
	},

	createWall: function(position, width, height, depth){
		var geometry = new THREE.BoxGeometry( width, height, depth );
		var texture = new THREE.TextureLoader().load( 'images/material/wall_2.jpg' );
 		var material = new THREE.MeshBasicMaterial( {map: texture} );
		var wall = new THREE.Mesh( geometry, material );
		wall.position.set(position.x, position.y, position.z);
		return wall;
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

	updateBack: function(back){
		back.updateMatrix();
		back.updateMatrixWorld(true);
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

	getPartSurfaceCenterPositionByRay: function(obj, str){
		var obj_center = this.getPartCenter(obj);
		var obj_size = this.getPartSize(obj);

		var raycaster = new THREE.Raycaster();		

		if(str == "up"){
			var pos = new THREE.Vector3(obj_center.x, obj_center.y + obj_size.y + 1, obj_center.z);
			raycaster.set(pos, new THREE.Vector3(0,-1,0));
		}
		if(str == "down"){
			var pos = new THREE.Vector3(obj_center.x, obj_center.y - obj_size.y - 1, obj_center.z);
			raycaster.set(pos, new THREE.Vector3(0,1,0));
		}
		if(str == "left"){
			var pos = new THREE.Vector3(obj_center.x - obj_size.x - 1, obj_center.y, obj_center.z);
			raycaster.set(pos, new THREE.Vector3(1,0,0));
		}
		if(str == "right"){
			var pos = new THREE.Vector3(obj_center.x + obj_size.x + 1, obj_center.y, obj_center.z);
			raycaster.set(pos, new THREE.Vector3(-1,0,0));
		}
		if(str == "front"){
			var pos = new THREE.Vector3(obj_center.x, obj_center.y, obj_center.z + obj_size.z + 1);
			raycaster.set(pos, new THREE.Vector3(0,0,-1));
		}
		if(str == "back"){
			var pos = new THREE.Vector3(obj_center.x, obj_center.y, obj_center.z - obj_size.z - 1);
			raycaster.set(pos, new THREE.Vector3(0,0,1));
		}

		var intersects = raycaster.intersectObject(obj);
		if(intersects.length > 0){
			return intersects[0].point;	
		}
		else{
			console.log("raycaster miss!");
			return "miss";
		}
	},

	getPartSurfaceCenterPositionByBox: function(obj, str){
		var obj_center = this.getPartCenter(obj);
		var obj_size = this.getPartSize(obj);
		if(str == "up")				
			return new THREE.Vector3(obj_center.x, obj_center.y+obj_size.y/2, obj_center.z);
		if(str == "down")
			return new THREE.Vector3(obj_center.x, obj_center.y-obj_size.y/2, obj_center.z);
		if(str == "left")
			return new THREE.Vector3(obj_center.x-obj_size.x/2, obj_center.y, obj_center.z);			
		if(str == "right")
			return new THREE.Vector3(obj_center.x+obj_size.x/2, obj_center.y, obj_center.z);
		if(str == "front")
			return new THREE.Vector3(obj_center.x, obj_center.y, obj_center.z+obj_size.z/2);
		if(str == "back")
			return new THREE.Vector3(obj_center.x, obj_center.y, obj_center.z-obj_size.z/2);
	},

//-------------------------------start board event--------------------------------------
	plantLoader: function(board){
		var plant;

		// loading manager
		var scene = this.main.scene;
		var loadingManager = new THREE.LoadingManager( function() {
			scene.add( plant );

			var box = new THREE.Box3();
			box.setFromObject(plant);
			var size_plant = new THREE.Vector3();
			box.getSize(size_plant);

			var center_board = new THREE.Vector3();
			box.setFromObject(board);
			box.getCenter(center_board);

			var board_matrix_inverse = new THREE.Matrix4();
			board_matrix_inverse.getInverse(board.matrixWorld, true);

			board.worldToLocal(center_board);

			plant.applyMatrix(board_matrix_inverse);
			plant.position.set(center_board.x, center_board.y, center_board.z);

			board.add(plant);
		} );

		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( "./models/plant1.dae", function ( collada ) {
			plant = collada.scene;
			plant.name = "plant";
			plant.scale.x = 0.05; plant.scale.y = 0.05; plant.scale.z = 0.05;
			

		} );
	},

	createBoard: function(obj, width, height, depth){
		//creat board x , depth > height
		while(this.hasChildren(obj))
			obj = obj.children[0];
		var material = new THREE.MeshBasicMaterial();

		if (Array.isArray(obj.material))
			material = obj.material[0].clone();
		else
			material = obj.material.clone();

		var geometry = chairCreateBoard(width, height, depth);	
		var board = new THREE.Mesh( geometry, material );		

		return board;
		
	},

	addBoard: function(furniture_clone){
		var moveTo = new THREE.Vector3(75, 25, 0);
		
		//remove other part
		var group = furniture_clone;		
		this.remove(group, 'back');

		//update chair back transfrom Matrix
		var back = group.getObjectByName ('back');		
		this.updateBack(back);		

		//creat board width > depth > height
		var size_back = this.getPartSize(back);
		var array = new Array();
		array.push(size_back.x, size_back.y, size_back.z);
		array.sort(function(a, b){return b-a});
		var width = size_back.x;
		var depth  = array[1]; 
		var height = array[2];

		var board = this.createBoard(back, width, height/10, depth/2);
		board.name = "board";
		
		//get chair back world position and back world matrix's inverse
		var component = furniture_clone.getObjectByName('back');		
		var pos = this.getPartCenter(component);
		var size_board = this.getPartSize(board);
		
		var back_matrix_inverse = new THREE.Matrix4();
		back_matrix_inverse.getInverse(back.matrixWorld, true);
		

		//set board position and rotation in back
		board.applyMatrix(back_matrix_inverse);
		board.position.set(pos.x - size_board.x/2, pos.y, pos.z);		
		back.worldToLocal(board.position);	

		//add borad to furniture
		group.add(board);

		//change max and min value
		var position_id = document.getElementById("CHAIR_ADD_POSITION");
		position_id.max = this.computeNumber(size_back.y / 2);
		position_id.min = this.computeNumber((size_back.y / 2) * (-1));

		var position_id = document.getElementById("CHAIR_ADD_WIDTH");
		position_id.max = this.computeNumber(size_board.z * 2 / 3);

		var position_id = document.getElementById("CHAIR_ADD_HEIGHT");
		position_id.max = this.computeNumber(size_board.z * 2 / 3);

		group.position.set(moveTo.x, moveTo.y, moveTo.z);

		this.plantLoader(board);
	},

	setBoard: function(furniture_clone){
		var moveTo = new THREE.Vector3(75, 25, 0);

		var group = furniture_clone;
		var board = group.getObjectByName('board');
		var back = group.getObjectByName ('back');	
		this.updateBack(back);

		//get parameters CHAIR_ADD_WIDTH, CHAIR_ADD_HEIGHT
		var segWidth = this.parameters.CHAIR_ADD_WIDTH;
		var segHeight = this.parameters.CHAIR_ADD_HEIGHT;

		board.scale.x = 1 + 0.05 * parseInt(segWidth);
		board.scale.z = 1 + 0.05 * parseInt(segHeight);

		//get chair back world position and back world matrix's inverse
		var component = group.getObjectByName('back');		
		var pos = this.getPartCenter(component);
		var size_board = this.getPartSize(board);
		
		var segPosition = this.parameters.CHAIR_ADD_POSITION;
		pos.y += parseInt(segPosition);
		board.position.set(pos.x - size_board.x/2, pos.y, pos.z);
		back.worldToLocal(board.position);
		
	},

	boardEvent: function(){
		if(!this.hasBoard){			
			var furniture_clone_board = new THREE.Object3D();
			furniture_clone_board = this.furnitures[0].getFurniture().clone();
			furniture_clone_board.name = "add_board";
			
			this.flagCutLeg = this.checkNeedCut(furniture_clone_board);
			
			this.addBoard(furniture_clone_board);
			
			var clone_size = this.getPartSize(furniture_clone_board);
			var wallPosition = new THREE.Vector3();
			wallPosition = this.getPartCenter(furniture_clone_board);
			wallPosition.z -= clone_size.z;
			wallPosition.x += 25;
			var wall = this.createWall(wallPosition, 200, 50, 10);				
			this.main.scene.add(furniture_clone_board);
			this.main.scene.add(wall);
			this.hasBoard = true;
		}
		else{
			var furniture_clone_board = this.main.scene.getObjectByName("add_board");
			this.setBoard(furniture_clone_board);
		}
	},
//-------------------------------end board event--------------------------------------

//-------------------------------start hook event--------------------------------------
	hookLoader: function(back){
		
		var hook;
		// loading manager
		var scene = this.main.scene;
		var chair_add = this;
		var loadingManager = new THREE.LoadingManager( function() {
			for (var i = 0; i < back.children.length; i++) {
				chair_add.createColumnHook(scene, back.children[i], hook);
			}		
		} );

		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( "./models/hook/source/B01020/B01020.dae", function ( collada ) {
			hook = collada.scene;
			hook.name = "hook";			
			hook.scale.x = 0.025; hook.scale.y = 0.025; hook.scale.z = 0.025;
		} );
	},

	createHook: function(scene, child, hook, position, offset){		
		var pos = new THREE.Vector3(position.x + offset, position.y, position.z + 10);
		var raycaster = new THREE.Raycaster();
		raycaster.set(pos, new THREE.Vector3(0,0,-1));
		var intersects = raycaster.intersectObject(child);
		if(intersects.length > 0){
			var hook_clone = hook.clone();

			var child_matrix_inverse = new THREE.Matrix4();
			child_matrix_inverse.getInverse(child.matrixWorld, true);
			hook_clone.applyMatrix(child_matrix_inverse);

			hook_clone.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
			child.worldToLocal(hook_clone.position);

			child.add( hook_clone );
		}
	},

	createColumnHook: function(scene, child, hook){
		//get hook size
		var box = new THREE.Box3();
		box.setFromObject(hook);
		var size_hook = new THREE.Vector3();
		box.getSize(size_hook);

		//get back size
		var center_child = new THREE.Vector3();
		box.setFromObject(child);
		box.getCenter(center_child);

		this.createHook(scene, child, hook, center_child, size_hook.x * (-3) );
		this.createHook(scene, child, hook, center_child, size_hook.x * 0 );
		this.createHook(scene, child, hook, center_child, size_hook.x * 3);		
	},

	addHook: function(furniture_clone){
		var moveTo = new THREE.Vector3(125, 25, 0);
		//remove other part
		var group = furniture_clone;		
		this.remove(group, 'back');
		//update chair back transfrom Matrix
		var back = group.getObjectByName ('back');		
		this.updateBack(back);

		group.position.set(moveTo.x, moveTo.y, moveTo.z);

		this.hookLoader(back);
			
	},

	hookEvent: function(){
		$('#parameter_control_chair_add').hide();
		if(!this.hasHook){
			var furniture_clone_hook = new THREE.Object3D();
			furniture_clone_hook = this.furnitures[0].getFurniture().clone();
			furniture_clone_hook.name = "add_hook";

			this.addHook(furniture_clone_hook);

			this.main.scene.add(furniture_clone_hook);
			this.hasHook = true;

		}
		else{
			var add_hook = this.main.scene.getObjectByName("add_hook");
			var back = add_hook.getObjectByName("back");

			var part = back.children[0];
			var box = new THREE.Box3();
			box.setFromObject(part);
			var helper = new THREE.Box3Helper( box, 0xffff00 );
			this.main.scene.add(helper);				
		}
	},

//-------------------------------end hook event--------------------------------------

//-------------------------------start flip event--------------------------------------
	flipEvent: function(){
		if(!this.hasFlip){
			var moveTo = new THREE.Vector3(175, 25, 0);

			var furniture_clone_flip = new THREE.Object3D();
			furniture_clone_flip = this.furnitures[0].getFurniture().clone();
			furniture_clone_flip.name = "add_flip";

			var szie = new THREE.Vector3();
			size = this.getPartSize(furniture_clone_flip);

			this.remove(furniture_clone_flip, "back");					

			var axis_x = new THREE.Vector3(1,0,0);

			furniture_clone_flip.rotateOnWorldAxis(axis_x, 3.14);
			
			var back = furniture_clone_flip.getObjectByName("back");
			var size_back = this.getPartSize(back);
			var array = new Array();
			array.push(size_back.x, size_back.y, size_back.z);
			array.sort(function(a, b){return b-a});
			var width = size_back.x;
			var depth  = array[1]; 
			var height = array[2];

			var board = this.createBoard(back, width, height/10, depth/2);
			board.name = "board";
			
			//get chair back world position and back world matrix's inverse
			var component = furniture_clone_flip.getObjectByName('back');		
			var pos = this.getPartCenter(component);
			var size_board = this.getPartSize(board);
			
			var back_matrix_inverse = new THREE.Matrix4();
			back_matrix_inverse.getInverse(back.matrixWorld, true);	

			//set board position and rotation in back
			board.applyMatrix(back_matrix_inverse);
			board.rotateOnWorldAxis(axis_x, 3.14);
			board.position.set(pos.x + size_board.x/2, pos.y, pos.z);		
			back.worldToLocal(board.position);	

			//add borad to furniture
			furniture_clone_flip.add(board);

			furniture_clone_flip.position.set(moveTo.x, moveTo.y + size.y, moveTo.z - size.z);

			this.main.scene.add(furniture_clone_flip);

			this.plantLoader(board);

			this.hasFlip = true;
		}
		else{
			var moveTo = new THREE.Vector3(175, 25, 0);

			var furniture_clone_flip = this.main.scene.getObjectByName("add_flip");
			var group = furniture_clone_flip;
			var board = group.getObjectByName('board');
			var back = group.getObjectByName ('back');	
			this.updateBack(back);

			//get parameters CHAIR_ADD_WIDTH, CHAIR_ADD_HEIGHT
			var segWidth = this.parameters.CHAIR_ADD_WIDTH;
			var segHeight = this.parameters.CHAIR_ADD_HEIGHT;

			board.scale.x = 1 + 0.05 * parseInt(segWidth);
			board.scale.z = 1 + 0.05 * parseInt(segHeight);

			//get chair back world position and back world matrix's inverse
			var component = group.getObjectByName('back');		
			var pos = this.getPartCenter(component);
			var size_board = this.getPartSize(board);
			
			var segPosition = this.parameters.CHAIR_ADD_POSITION;
			pos.y += parseInt(segPosition);
			board.position.set(pos.x + size_board.x/2, pos.y, pos.z);
			back.worldToLocal(board.position);
		}
		
	},
//-------------------------------end flip event--------------------------------------


//-------------------------------start hang event--------------------------------------
	
	createRope:function(boardPosition, wallPosition){
		var ropeNumSegments = 10;
		var ropeLength = Math.abs(boardPosition.y - wallPosition.y);
		var segmentLength = ropeLength / ropeNumSegments;
		var ropeGeometry = new THREE.BufferGeometry();
		var ropeMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
		var ropePositions = [];
		var ropeIndices = [];
		for ( var i = 0; i < ropeNumSegments + 1; i++ ) {
			ropePositions.push( boardPosition.x, boardPosition.y + i * segmentLength, boardPosition.z );
		}
		for ( var i = 0; i < ropeNumSegments; i++ ) {
			ropeIndices.push( i, i + 1 );
		}
		ropeGeometry.setIndex( new THREE.BufferAttribute( new Uint16Array( ropeIndices ), 1 ) );
		ropeGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ropePositions ), 3 ) );
		ropeGeometry.computeBoundingSphere();
		rope = new THREE.LineSegments( ropeGeometry, ropeMaterial );
		rope.castShadow = true;
		rope.receiveShadow = true;
		this.main.scene.add( rope );
	},

	hangEvent: function(){
		//init:
		//1. one chair, 2. a base, 3. two cubes, vertical cube horizontal cube 
		//chair will hang at position(-50,25,0)		

		//chair
		var hang = new THREE.Object3D();
		hang = this.furnitures[0].getFurniture().clone();
		console.log(this.furnitures[0].getFurniture());
		this.checkHasMidFrame(hang);
		console.log(hang);
		hang.name = "add_hang";
		hang.position.set(-100, 25, 0);
		this.main.scene.add(hang);
		var hang_size = this.getPartSize(hang);
		var hang_centerPosition = this.getPartCenter(hang);

		
		//base
		var baseMaterial = new THREE.MeshBasicMaterial({ color: 0x606060 });
		var baseGeometry = new THREE.BoxGeometry( 25, 10, 25 );	
		var base = new THREE.Mesh( baseGeometry, baseMaterial );
		base.name = "base";
		var base_size = this.getPartSize(base);
		base.position.set(hang_centerPosition.x - 40, 0, hang_centerPosition.z);
		this.main.scene.add(base);

		//vertical cube
		var verticalCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x606060 });
		var verticalCubeGeometry = new THREE.BoxGeometry( 15, hang_centerPosition.y + hang_size.y * 2 , 15 );	
		var verticalCube = new THREE.Mesh( verticalCubeGeometry, verticalCubeMaterial );
		verticalCube.name = "verticalCube";
		var verticalCube_size = this.getPartSize(verticalCube);
		verticalCube.position.set(base.position.x, verticalCube_size.y/2, base.position.z);
		var verticalCube_centerPosition = this.getPartCenter(verticalCube);
		this.main.scene.add(verticalCube);
		

		//horizontal cube
		var horizontalCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x606060 });
		var horizontalCubeGeometry = new THREE.BoxGeometry( (Math.abs(base.position.x - hang.position.x)+
															base_size.x+hang_size.x)*1.25, 15, 15 );	
		var horizontalCube = new THREE.Mesh( horizontalCubeGeometry, horizontalCubeMaterial );
		horizontalCube.name = "horizontalCube";
		horizontalCube.position.set((base.position.x+hang.position.x)/2, 
			verticalCube_centerPosition.y + verticalCube_size.y/2, base.position.z);
		this.main.scene.add(horizontalCube);

		//remove unknow part
		this.remove3(hang, "back", "seat", "midframe");

		//step1: a1) create two boards. b) get seat four angles.
		//		 a2) get two positions on each boards.

		//(a)
		var back = hang.getObjectByName("back");
		var back_size = this.getPartSize(back);
		var bak_center = this.getPartCenter(back);

		var seat = hang.getObjectByName("seat");
		var seat_size = this.getPartSize(seat);
		var seat_center = this.getPartCenter(seat);

		var midframe = hang.getObjectByName("midframe");
		var midframe_size = this.getPartSize(midframe);
		var midframe_center = this.getPartCenter(midframe);

		var hang_inverse = new THREE.Matrix4();
		hang_inverse.getInverse(hang.matrixWorld, true);		

		var board1 = this.createBoard(back, seat_size.x *1.5 , seat_size.y, seat_size.z/3);
		board1.name = "board1";
		var board1_size = this.getPartSize(board1);
		board1.applyMatrix(hang_inverse);		

		var board2 = this.createBoard(back, seat_size.x *1.5 , seat_size.y, seat_size.z/3);
		board2.name = "board2";
		var board2_size = this.getPartSize(board2);
		board2.applyMatrix(hang_inverse);

		var seat_downPosition = this.getPartSurfaceCenterPositionByRay(seat, "down");
		if(seat_downPosition == "miss")
			seat_downPosition = this.getPartSurfaceCenterPositionByBox(seat, "down");

		board1.position.set(seat_downPosition.x - board1_size.x/2, seat_downPosition.y - board1_size.y - 
			midframe_size.y/2, seat_downPosition.z - seat_size.z/2 + board1_size.z/3);
		hang.worldToLocal(board1.position);

		board2.position.set(seat_downPosition.x - board2_size.x/2, seat_downPosition.y - board2_size.y - 
			midframe_size.y/2, seat_downPosition.z + seat_size.z/2 - board2_size.z * 2/3);
		hang.worldToLocal(board2.position);


		hang.add(board1);
		hang.add(board2);

		//step2: create four ropes on these positions.
		var board1_center = this.getPartCenter(board1);
		var board1_RightRopePosition = new THREE.Vector3();
		var offset = (board1_size.x + seat_size.x)/4;
		board1_RightRopePosition.set(board1_center.x+offset, board1_center.y, board1_center.z);

		var wallPosition1 = this.getPartSurfaceCenterPositionByRay(horizontalCube, "down");
		wallPosition1.setX(board1_RightRopePosition.x);
		this.createRope(board1_RightRopePosition, wallPosition1);


		var board1_LeftRopePosition = new THREE.Vector3();
		board1_LeftRopePosition.set(board1_center.x-offset, board1_center.y, board1_center.z);

		wallPosition1.setX(board1_LeftRopePosition.x);
		this.createRope(board1_LeftRopePosition, wallPosition1);

		var board2_center = this.getPartCenter(board2);
		var board2_RightRopePosition = new THREE.Vector3();
		offset = (board2_size.x + seat_size.x)/4;
		board2_RightRopePosition.set(board2_center.x+offset, board2_center.y, board2_center.z);

		var wallPosition2 = this.getPartSurfaceCenterPositionByRay(horizontalCube, "down");
		wallPosition2.setX(board2_RightRopePosition.x);
		this.createRope(board2_RightRopePosition, wallPosition2);


		var board2_LeftRopePosition = new THREE.Vector3();
		board2_LeftRopePosition.set(board2_center.x-offset, board2_center.y, board2_center.z);

		wallPosition2.setX(board2_LeftRopePosition.x);
		this.createRope(board2_LeftRopePosition, wallPosition2);

	},

//-------------------------------end hang event----------------------------------------

/////////////////////////////////////////////////////////////////////////////////////////////

//-----------------------------------------------------------------------------------
	execute: function(){

		if(this.checkHasBack(this.furnitures[0]) && this.checkHasSeat(this.furnitures[0])){			
			
			//$('#parameter_control_chair_add').show();
			//this.boardEvent();			
			//this.hookEvent();
			//this.flipEvent();
			this.hangEvent();	
		}
		else
			alert("Please mark seat and back");		
	}
}

module.exports = Chair_Add