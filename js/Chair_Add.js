const chairCreatBoard = require('./chairCreatBoard')
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
}


Chair_Add.prototype = {

//--------------------------------------------------------------------------------------------
	init : function() {
		this.hasBoard = false;
		this.hasHook = false;
	},
//--------------------------------------------------------------------------------------------

	checkHasSeat: function(furniture) {		
		return furniture.hasComponent('seat');
	},

	checkHasBack: function(furniture) {		
		return furniture.hasComponent('back');
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
	
	

	plantLoader: function(board){
		var plant;

		// loading manager
		var scene = this.main.scene;
		var loadingManager = new THREE.LoadingManager( function() {
			scene.add( plant );
		} );

		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( "./models/plant1.dae", function ( collada ) {
			plant = collada.scene;
			plant.name = "plant";
			plant.scale.x = 0.05; plant.scale.y = 0.05; plant.scale.z = 0.05;
			
			var box = new THREE.Box3();
			box.setFromObject(plant);
			var size_plant = new THREE.Vector3();
			box.getSize(size_plant);

			var center_board = new THREE.Vector3();
			box.setFromObject(board);
			box.getCenter(center_board);

			var board_matrix_inverse = new THREE.Matrix4();
			board_matrix_inverse.getInverse(board.matrixWorld, true);

			plant.applyMatrix(board_matrix_inverse);
			plant.position.set(center_board.x, center_board.y, center_board.z);

			scene.add(plant);
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

	hasChildren: function(obj){
		if (obj.children.length != 0)
			return true;
		return false;
		
	},

	creatWall: function(position, width, height, depth){
		var geometry = new THREE.BoxGeometry( width, height, depth );
		var texture = new THREE.TextureLoader().load( 'images/material/wall_2.jpg' );
 		var material = new THREE.MeshBasicMaterial( {map: texture} );
		var wall = new THREE.Mesh( geometry, material );
		wall.position.set(position.x, position.y, position.z);
		return wall;
	},

	creatBoard: function(obj, width, height, depth){
		//creat board x , depth > height
		while(this.hasChildren(obj))
			obj = obj.children[0];
		var material = new THREE.MeshBasicMaterial();

		if (Array.isArray(obj.material))
			material = obj.material[0].clone();
		else
			material = obj.material.clone();

		var geometry = chairCreatBoard(width, height/10, depth/2);	
		var board = new THREE.Mesh( geometry, material );		

		return board;
		
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

		var board = this.creatBoard(back, width, height, depth);
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

		var plant = this.main.scene.getObjectByName("plant");
		var box = new THREE.Box3();
		var center_board = new THREE.Vector3();
		box.setFromObject(board);
		box.getCenter(center_board);
		plant.position.set(center_board.x, center_board.y, center_board.z);
		
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
	//////////////////////////////////////////////////////////////////////////

	execute: function(){		
		var flagCutLeg = false;
		if(this.checkHasBack(this.furnitures[0]) && this.checkHasSeat(this.furnitures[0])){
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
				var wall = this.creatWall(wallPosition, 100, 50, 10);				
				this.main.scene.add(furniture_clone_board);
				this.main.scene.add(wall);
				this.hasBoard = true;
				
//-------------------------------------------------------------------------------
/*
				if(this.flagCutLeg){
					var back = this.main.scene.getObjectByName("add_board");

					var parts = new Array();
					this.findAllChildren(parts, back);
					
					var positions = new Array();
					var values_x = new Array();
					for (var i = 0; i < parts.length - 1; i++) {
						positions.push(this.getPartCenter(parts[i]));
						values_x.push( this.getPartCenter(parts[i]).x ); 
					}
					
					//left
					var min = values_x[0];
					var id_left = 0;
					for (var i = 0; i < values_x.length; i++) {
						if(min > values_x[i]){
							min = values_x[i];
							id_left = i;
						}				
					}					

					//right
					var max = values_x[0];
					var id_right = 0;
					for (var i = 0; i < values_x.length; i++) {
						if(max < values_x[i]){
							max = values_x[i];
							id_right = i;
						}				
					}			

					console.log(back.children[0]);
					var geometry = chairCutBack(parts[id_right]);
					var material = back.children[0].material;
					var test = new THREE.Mesh( geometry, material );
					test.position.set(0,0,0);
					this.main.scene.add(test);

				}
*/			
//-------------------------------------------------------------------------------
			}
			else{
				var furniture_clone_board = this.main.scene.getObjectByName("add_board");
				this.setBoard(furniture_clone_board);
			}
			
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
			
		}
		else
			alert("Please mark seat and back");		
	}

}


module.exports = Chair_Add