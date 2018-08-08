
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

	computeNumber: function (value) {		
		if (value < 0)
	        return Math.ceil(value);
	    else
	    	return Math.floor(value);
	},

	changeToWorldVector: function (vector) {
		var world_vector = new THREE.Vector3();	
		if (vector.x < 0){
	        world_vector.x = Math.floor(vector.x);
		}
	    else{
	    	if (vector.x < 0.5) {
	    		world_vector.x = Math.floor(vector.x);
	    	}
	    	else{
	    		world_vector.x = Math.ceil(vector.x);
	    	}	    	
	    }

	    if (vector.y < 0){
	        world_vector.y = Math.floor(vector.y);
		}
	    else{
	    	if (vector.y < 0.5) {
	    		world_vector.y = Math.floor(vector.y);
	    	}
	    	else{
	    		world_vector.y = Math.ceil(vector.y);
	    	}	    	
	    }

	    if (vector.z < 0){
	        world_vector.z = Math.floor(vector.z);
		}
	    else{
	    	if (vector.z < 0.5) {
	    		world_vector.z = Math.floor(vector.z);
	    	}
	    	else{
	    		world_vector.z = Math.ceil(vector.z);
	    	}	    	
	    }

	    return world_vector;
	},

	remove: function(group, name){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str != name) {
				group.remove(group.children[i]);
			}	
		}
	},

	creatBoard: function(obj, width, height, depth){
		console.log(obj);
		var geometry = new THREE.BoxGeometry( height/2, width, depth );
		var texture = new THREE.TextureLoader().load( 'images/material/material3.jpg' );
 		var material = new THREE.MeshBasicMaterial( {map: texture} );
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

	addBoard: function(){
		//remove other part
		var group = this.furnitures[0].getFurniture();		
		this.remove(group, 'back');

		//update chair back transfrom Matrix
		var back = group.getObjectByName ('back');		
		this.updateBack(back);

		//get chair back world position
		var pos = this.furnitures[0].getComponentCenterPosition('back');

		//creat board
		var size = this.getPartSize(back);
		var width = size.x;  
		var height = size.y; 
		var depth  = size.z; 
		var board = this.creatBoard(back, width, height, depth);
		board.name = "board";
		
		//change max and min value
		var position_id = document.getElementById("CHAIR_ADD_POSITION");
		position_id.max = this.computeNumber(size.y / 2);
		position_id.min = this.computeNumber((size.y / 2) * (-1));


		size = this.getPartSize(board);
		width = size.x;  
		height = size.z; 
		depth  = size.y;


		//calculate offset axis.z		
		pos.z += width/2;
		

		//turn chair back world position to local position
		back.worldToLocal(pos);
		
		//set board position
		board.position.set(pos.x, pos.y, pos.z);

		//add borad to furniture
		group.add(board);
	},

	setBoard: function(){
		var group = this.furnitures[0].getFurniture();
		var board = group.getObjectByName('board');
		var back = group.getObjectByName ('back');	
		this.updateBack(back);

		//get parameters CHAIR_ADD_WIDTH, CHAIR_ADD_HEIGHT
		var segWidth = this.parameters.CHAIR_ADD_WIDTH;
		var segHeight = this.parameters.CHAIR_ADD_HEIGHT;

		//if local axis x(1,0,0) local to world (0,0,1), then local axis x = world axis z
		var local_x = new THREE.Vector3(1, 0, 0);
		var local_y = new THREE.Vector3(0, 1, 0);
		var local_z = new THREE.Vector3(0, 0, 1);

		back.localToWorld(local_x);
		back.localToWorld(local_y);
		back.localToWorld(local_z);

		local_x = this.changeToWorldVector(local_x);
		local_y = this.changeToWorldVector(local_y);
		local_z = this.changeToWorldVector(local_z);
		
		if(local_x.x != 0){
			board.scale.x = 1 + 0.05 * parseInt(segWidth);
		}
		if(local_y.x != 0){
			board.scale.y = 1 + 0.05 * parseInt(segWidth);
		}
		if(local_z.x != 0){
			board.scale.z = 1 + 0.05 * parseInt(segWidth);
		}

		if(local_x.z != 0){
			board.scale.x = 1 + 0.05 * parseInt(segHeight);
		}
		if(local_y.z != 0){
			board.scale.y = 1 + 0.05 * parseInt(segHeight);
		}
		if(local_z.z != 0){
			board.scale.z = 1 + 0.05 * parseInt(segHeight);
		}
		
		
		var size = this.getPartSize(board);				
		var width = size.x;  
		var height = size.z;
		var depth = size.y;

		//get chair back world position
		var pos = this.furnitures[0].getComponentCenterPosition('back');

		//set POSITION offset axis.y
		var segPosition = this.parameters.CHAIR_ADD_POSITION;
		pos.y += parseInt(segPosition);

		//calculate offset axis.z		
		pos.z += height/2;
		

		//turn chair back world position to local position
		back.worldToLocal(pos);
		
		//set board position
		board.position.set(pos.x, pos.y, pos.z);
	},
	//////////////////////////////////////////////////////////////////////////

	execute: function(){
		if(this.checkHasBack(this.furnitures[0]) && this.checkHasSeat(this.furnitures[0])){			
			if(!this.hasBoard){
				this.addBoard();
				this.hasBoard = true;
			}
			else{
				this.setBoard();				
			}			
		}
		else
			alert("Please mark seat and back");		
	}

}


module.exports = Chair_Add