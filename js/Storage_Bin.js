const chairCutBackFlip = require('./chairCutBackFlip');

function Storage_Bin (main) {
	this.main = main;
	this.furnitures = main.furnitures;
}

Storage_Bin.prototype = {
	checkHasSeat: function(furniture) {		
		return furniture.hasComponent('seat');
	},

	checkHasBack: function(furniture) {		
		return furniture.hasComponent('back');
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

	getPartCenter: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_center = new THREE.Vector3();
		box.getCenter (box_center);

		return box_center;
	},

	getPartSize: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);

		//this includes width, height, depth
		return box_size;
	},

	objectAddToFurniture: function(furniture, object, position) {
		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture.matrixWorld);	
		object.applyMatrix(inverse);		
		furniture.worldToLocal(position);		
		object.position.set(position.x, position.y, position.z);		
		furniture.add(object);		
	},

	remove: function(furniture){
		var group = furniture.getFurniture();
		var seat = group.getObjectByName("back");
		var center_seat = this.getPartCenter(seat);
		var parts = new Array();
		this.findAllChildren(parts, group);
		for (var i = parts.length - 1; i >= 0; i--) {
			if(parts[i].type == "Mesh"){
				if (parts[i].name == "") {
					var center_obj = this.getPartCenter(parts[i]);
					if(center_obj.y > center_seat.y)
						group.remove(parts[i]);
				}
			}
		}
	},

	flip: function(furniture) {
		//back up the position
		var center = furniture.getFurnitureCenter();

		var targetVector = new THREE.Vector3(0, -1, 0);
		furniture.setRotationWithNormalAxis("seat", targetVector);
		var group = this.furnitures[0].getFurniture();
		var size = this.furnitures[0].getSize();
		group.position.set(center.x, center.y + size.y / 2, center.z);
	},

	cut: function(furniture){
		var group = furniture.getFurniture();
		console.log(group);
		var back = group.getObjectByName("back");
		var seat = group.getObjectByName("seat");
		var size_seat = this.getPartSize(seat);
		var center_seat = this.getPartCenter(seat);

		var parts = new Array();
		this.findAllChildren(parts, back);
		var backMaterial = new THREE.MeshBasicMaterial();
		if (Array.isArray(parts[0].material))
			backMaterial = parts[0].material[0].clone();
		else
			backMaterial = parts[0].material.clone();
		
		var values_x = new Array();
		for (var i = 0; i < parts.length; i++) {
			values_x.push( this.getPartCenter(parts[i]).x ); 
		}
		
		// left
		var min = values_x[0];
		var id_left = 0;
		for (var i = 0; i < values_x.length; i++) {
			if(min > values_x[i]){
				min = values_x[i];
				id_left = i;
			}				
		}
		parts[id_left].name = "left";

		//right
		var max = values_x[0];
		var id_right = 0;
		for (var i = 0; i < values_x.length; i++) {
			if(max < values_x[i]){
				max = values_x[i];
				id_right = i;
			}				
		}

		var center = this.getPartCenter(parts[id_left]);
		var size = this.getPartSize(parts[id_left]);
		var offset = (center_seat.y + size_seat.y / 2) / group.scale.y; 
		var backGeometry1 = chairCutBackFlip(parts[id_left].geometry, offset);
		var test1 = new THREE.Mesh( backGeometry1, backMaterial );
		test1.name = "test1";
		back.remove(parts[id_left]);
		group.add(test1);

		center = this.getPartCenter(parts[id_right]);
		size = this.getPartSize(parts[id_right]);
		offset = (center_seat.y + size_seat.y / 2) / group.scale.y; 
		var backGeometry2 = chairCutBackFlip(parts[id_right].geometry, offset);
		var test2 = new THREE.Mesh( backGeometry2, backMaterial );
		test2.name = "test2";
		back.remove(parts[id_right]);
		group.add(test2);

		group.remove(back);
	},

	execute: function(tfname){
		if(this.checkHasBack(this.furnitures[0]) && this.checkHasSeat(this.furnitures[0])){
			this.remove(this.furnitures[0]);
			this.cut(this.furnitures[0]);
			this.flip(this.furnitures[0]);
		}
		else
			alert("Please mark seat and back");	
	}
}

module.exports = Storage_Bin