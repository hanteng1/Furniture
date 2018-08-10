const chairCreatBoard = require('./chairCreatBoard')

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

 	
}


Chair_Add.prototype = {

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

	changeParameterValue: function(pname, value) {
		this.parameters[pname] = value;

		//console.log(this.parameters[pname]);

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
			
			console.log(center_board);

			var board_matrix_inverse = new THREE.Matrix4();
			board_matrix_inverse.getInverse(board.matrixWorld, true);

			plant.applyMatrix(board_matrix_inverse);
			plant.position.set(center_board.x, center_board.y, center_board.z);
			//board.worldToLocal(plant.position);

			scene.add(plant);

			console.log(plant);
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

	getObjCenter: function(component){
		var box = new THREE.Box3();
		box.setFromObject(component);
		var pos = new THREE.Vector3();
		if(box.isEmpty() === false)
		{
			box.getCenter(pos);
		}else{
			console.log("error on getting center point");
		}
		return pos;
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
		var pos = this.getObjCenter(component);
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
		var pos = this.getObjCenter(component);
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
	//////////////////////////////////////////////////////////////////////////

	execute: function(){
		var hasBoard = false;
		var hasHook = false;		

		if(this.checkHasBack(this.furnitures[0]) && this.checkHasSeat(this.furnitures[0])){
			if(!this.hasBoard){
				var furniture_clone_board = new THREE.Object3D();
				furniture_clone_board = this.furnitures[0].getFurniture().clone();
				furniture_clone_board.name = "add_board";

				this.addBoard(furniture_clone_board);

				
				var clone_size = this.getPartSize(furniture_clone_board);
				var wallPosition = new THREE.Vector3();
				wallPosition = this.getObjCenter(furniture_clone_board);
				wallPosition.z -= clone_size.z;
				wallPosition.x -= 10;
				var wall = this.creatWall(wallPosition, 50, 50, 10);
				
				this.main.scene.add(furniture_clone_board);
				this.main.scene.add(wall);

				this.hasBoard = true;
			}
			else{
				var furniture_clone_board = this.main.scene.getObjectByName("add_board");
				this.setBoard(furniture_clone_board);	
			}
			/*
			if(!this.hasHook){
				var furniture_clone_hook = new THREE.Object3D();
				furniture_clone_hook = this.furnitures[0].getFurniture().clone();
				furniture_clone_hook.name = "add_hook";

				this.addHook(furniture_clone_hook);

				this.main.scene.add(furniture_clone_hook);
				this.hasBoard = true;

			}
			else{

			}
			*/
		}
		else
			alert("Please mark seat and back");		
	}

}


module.exports = Chair_Add