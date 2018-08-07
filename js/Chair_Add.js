//


function Chair_Add (main) {
 	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed


	this.parameters = {
		POSITION: 0
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

	//////////////////////////////////////////////////////////////////////////

	execute: function(){
		if (this.checkHasBack(this.furnitures[0])) {
			
			//remove other part
			var group = this.furnitures[0].getFurniture();			
			
			for (var i = group.children.length - 1; i >= 0 ; i--) {				
				var name = group.children[i].name;
				if (name != 'back') {
					group.remove(group.children[i]);
				}		
			}


			//creat board
			var size = this.furnitures[0].getSize();
			////console.log("size.x = " + size.x + "size.y = " + size.y + "size.z = " + size.z);
			var width = size.x;
			var height = size.y;
			var depth  = size.z;

			if(height > width)
				height= height/2;
			else
				width = width/2;

			var geometry = new THREE.BoxGeometry( width, height, depth );
			var material = new THREE.MeshBasicMaterial( {color: 0x9C5F04} );
			var board = new THREE.Mesh( geometry, material );

			//get chair back world position
			var pos = this.furnitures[0].getComponentCenterPosition('back');
			////console.log(pos); // check type = Vector3
			////console.log("back position: (" + pos.x + ", " + pos.y + ", " + pos.z + ")");


			//update chair back transfrom Matrix
			var back = group.getObjectByName ('back');
			////console.log(back); // check type = Object3D
			back.updateMatrix();
			back.updateMatrixWorld(true);


			//turn chair back world position to loacl position
			back.worldToLocal(pos);
			if(height > width)
				pos.x += height/2;
			else
				pos.x += width/2;

			var segPosition = this.parameters.POSITION;
			console.log(segPosition);
			pos.z += parseInt(segPosition);

			//set board position
			board.position.set(pos.x, pos.y, pos.z);
			console.log("board position: (" + board.position.x + ", " + board.position.y + ", " + board.position.z + ")");


			//add borad to furniture
			group.add(board);			
		}		
	}

}
