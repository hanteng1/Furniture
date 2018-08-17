"use strict;"

const dresserCutSpace = require('./dresserCutSpace')

function Dresser_Add (main){
	this.main = main;
	this.furnitures = main.furnitures;
}


Dresser_Add.prototype = {
	checkHasTopFront: function(furniture) {
		var obj = furniture.getFurniture();
		// console.log(obj);
		var str1 = "cabinetTop-cabinetFront";
		var str2 = "cabinetFront-cabinetTop";
		for (var i = 0; i < obj.children.length; i++) {
			if(obj.children[i].name == str1 || obj.children[i].name == str2)
				return true;			
		}
		return false;
	},

	hasChildren: function(obj){
		if (obj.children.length != 0)
			return true;
		return false;		
	},

	getPartCenter: function(obj) {
		var vector = new THREE.Vector3();
		var box = new THREE.Box3();
		box.setFromObject(obj);
		box.getCenter(vector);
		return vector;
	},

	getPartSize: function(obj){
		var vector = new THREE.Vector3();
		var box = new THREE.Box3();
		box.setFromObject(obj);
		box.getSize(vector);
		return vector;
	},

	getAllChildren: function(obj, array){
		
		if (obj.children.length > 0) {
			for (var i = 0; i < obj.children.length; i++) {
				if(obj.children[i].type == "Mesh" || obj.children[i].type == "Object3D"){
					this.getAllChildren(obj.children[i], array);
				}	
			}
		}
		else
			array.push(obj);
			
	},

	getAllCorners: function(obj){
		// 0-----1   4-----5
		// | up  |   | down|
		// |     |   |     |
		// 3-----2   7-----6

		var corners = new Array();
		var center = this.getPartCenter(obj);
		var size = this.getPartSize(obj);

		//0
		var point = new THREE.Vector3();
		var x = center.x - size.x/2;
		var y = center.y + size.y/2;
		var z = center.z - size.z/2;
		point.set(x,y,z);
		corners.push(point);
		//1
		x = center.x + size.x/2;
		y = center.y + size.y/2;
		z = center.z - size.z/2;
		point.set(x,y,z);
		corners.push(point);
		//2
		x = center.x + size.x/2;
		y = center.y + size.y/2;
		z = center.z + size.z/2;
		point.set(x,y,z);
		corners.push(point);
		//3
		x = center.x - size.x/2;
		y = center.y + size.y/2;
		z = center.z + size.z/2;
		point.set(x,y,z);
		corners.push(point);
		//4
		x = center.x - size.x/2;
		y = center.y - size.y/2;
		z = center.z - size.z/2;
		point.set(x,y,z);
		corners.push(point);

		//5
		x = center.x + size.x/2;
		y = center.y - size.y/2;
		z = center.z - size.z/2;
		point.set(x,y,z);
		corners.push(point);

		//6
		x = center.x + size.x/2;
		y = center.y - size.y/2;
		z = center.z + size.z/2;
		point.set(x,y,z);
		corners.push(point);

		//7
		x = center.x - size.x/2;
		y = center.y - size.y/2;
		z = center.z + size.z/2;
		point.set(x,y,z);
		corners.push(point);
		return corners;
	},

	markCabinet: function(furniture){
		var obj = furniture.getObjectByName("cabinetTop-cabinetFront");
		if(typeof obj == 'undefined')
			obj = furniture.getObjectByName("cabinetFront-cabinetTop");
		
		if(obj.children.length > 0){
			for (var i = 0; i < obj.children.length; i++) {
				obj.children[i].name = "Dresser_part";
			}
		}		
		obj.name = "Dresser";
			
	},

	markDrawer: function(furniture){
		var children = new Array();
		this.getAllChildren( furniture, children );
		// console.log(children);

		var checkbox = new THREE.Box3();
		checkbox.setFromObject(furniture.getObjectByName("Dresser"));
		for(var i = 0; i < children.length ; i++){
			var box = new THREE.Box3();
			box.setFromObject(children[i]);
			// var boxHelper = new THREE.Box3Helper(box, 0x000000);
			// this.main.scene.add(boxHelper);
			if(children[i].name == ""){
				if(checkbox.intersectsBox(box))
					children[i].name = "drawer";
			}			
		}
	},

	countColumn:function(furniture){
		var drawers = new Array();
		for (var i = 0; i < furniture.children.length; i++) {
			if(furniture.children[i].name == "drawer")
				drawers.push(furniture.children[i]);
		}
		
		var centers = new Array();
		for (var i = 0; i < drawers.length; i++) {
			centers.push(Math.floor(this.getPartCenter(drawers[i]).y * 100)/100);
		}

		centers.sort(function(a, b){return a-b});
		// console.log("centers");
		// console.log(centers);

		var count = 1;
		for (var i = 1; i < centers.length; i++) {
			if(centers[i] != centers[i-1])
				count++; 
		}

		// console.log("count");
		// console.log(count);
		return count;
	},

	getNeedCutSpace: function(furniture, numberOfColumn, removeNumber){
		if(removeNumber <= numberOfColumn){
			var drawers = new Array();
			for (var i = 0; i < furniture.children.length; i++) {
				if(furniture.children[i].name == "drawer")
					drawers.push(furniture.children[i]);
			}
			
			var centers = new Array();
			for (var i = 0; i < drawers.length; i++) {
				centers.push(Math.floor(this.getPartCenter(drawers[i]).y * 100)/100);
			}

			var centers_clone = centers.slice(0);
			centers_clone.sort(function(a, b){return b-a});
			// console.log("centers_clone");
			// console.log(centers_clone);

			var count = new Array();
			count.push(centers_clone[0]);
			for (var i = 1; i < centers_clone.length; i++) {
				if(centers_clone[i] != centers_clone[i-1])
					count.push(centers_clone[i]);
			}
			// console.log("count");
			// console.log(count);

			var tmp = new Array();
			for(var i = 0; i < removeNumber; i++){
				for (var j = 0; j < centers.length; j++) {
					if(count[i] == centers[j]){
						var box = new THREE.Box3();
						box.setFromObject(drawers[j]);
						tmp.push(box);
					}
				}				
			}
			var space = new THREE.Box3();
			for (var i = 0; i < tmp.length; i++) {
				space.union(tmp[i]);
			}
			
			// console.log("space");
			// console.log(space);
			//space.max.y *= 2;
			// console.log("space");
			// console.log(space);

			// var boxHelper = new THREE.Box3Helper(space, 0x000000);
			// this.main.scene.add(boxHelper);

			return space;
		}
		else
			console.log("Remove columns fail.");
	},

	removeDrawersByColumn: function(furniture, numberOfColumn, removeNumber){
		if(removeNumber <= numberOfColumn){
			var drawers = new Array();
			for (var i = 0; i < furniture.children.length; i++) {
				if(furniture.children[i].name == "drawer")
					drawers.push(furniture.children[i]);
			}
			
			var centers = new Array();
			for (var i = 0; i < drawers.length; i++) {
				centers.push(Math.floor(this.getPartCenter(drawers[i]).y * 100)/100);
			}

			var centers_clone = centers.slice(0);
			centers_clone.sort(function(a, b){return b-a});
			// console.log("centers_clone");
			// console.log(centers_clone);

			var count = new Array();
			count.push(centers_clone[0]);
			for (var i = 1; i < centers_clone.length; i++) {
				if(centers_clone[i] != centers_clone[i-1])
					count.push(centers_clone[i]);
			}
			// console.log("count");
			// console.log(count);

			for(var i = 0; i < removeNumber; i++){
				for (var j = 0; j < centers.length; j++) {
					if(count[i] == centers[j]){
						// console.log("remove!!");
						furniture.remove(drawers[j]);
					}
				}				
			}
		}
		else
			console.log("Remove columns fail.");
	},

	cutToChairEvent: function() {
		// body...
		var moveTo = new THREE.Vector3(10,0,0)
		var furniture_cutToChair = new THREE.Object3D();
		furniture_cutToChair = this.furnitures[0].getFurniture().clone();
		furniture_cutToChair.position.set(moveTo.x, moveTo.y, moveTo.z);
		this.main.scene.add(furniture_cutToChair);

		this.markCabinet(furniture_cutToChair);		
		this.markDrawer(furniture_cutToChair);
		// console.log("furniture_cutToChair");
		// console.log(furniture_cutToChair);

		var numColumn = this.countColumn(furniture_cutToChair);

		var parameter = 2;
		var spaceBox = this.getNeedCutSpace(furniture_cutToChair, numColumn, parameter);
		this.removeDrawersByColumn(furniture_cutToChair, numColumn, parameter);
		
		var size = new THREE.Vector3();
		var position = new THREE.Vector3();

		spaceBox.getSize(size);
		spaceBox.getCenter(position);
		var geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
		var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
		var cube = new THREE.Mesh( geometry, material );
		var dresser_inverse = new THREE.Matrix4();
		dresser_inverse.getInverse(furniture_cutToChair.matrixWorld, true);
		cube.applyMatrix(dresser_inverse);
		cube.position.set(position.x, position.y, position.z);
		furniture_cutToChair.worldToLocal(cube.position);
		furniture_cutToChair.add(cube);

		var dresser = furniture_cutToChair.getObjectByName("Dresser");
		console.log("dresser");
		console.log(dresser);
		// var verticesAttribute = dresser.geometry.getAttribute('position');
		// var verticesArray = verticesAttribute.array;
		// var itemSize = verticesAttribute.itemSize;
		// var verticesNum = verticesArray.length / itemSize;
		// var beforeLength = verticesNum;
		// var modifer = new THREE.SimplifyModifier();
		// var simplified = modifer.modify( dresser.geometry,  beforeLength * 0.5 | 0 );
		// console.log(simplified);

		if(dresser.children.length > 0){
			var tmp = dresser.children[0];
			while(this.hasChildren(tmp))
				tmp = tmp.children[0];
		}
		else{
			var tmp = new THREE.Object3D;
			tmp = dresser;
		}
		
		var dresserMaterial = new THREE.MeshBasicMaterial();
		if (Array.isArray(tmp.material))
			dresserMaterial = tmp.material[0].clone();
		else
			dresserMaterial = tmp.material.clone();

		// console.log("cube");
		// console.log(cube);
		//var cutResultGeometry = dresserCutSpace(dresser.geometry, cube.geometry);
		var cutResultGeometry = dresserCutSpace(dresser.geometry, position, size);

		var newDresser = new THREE.Mesh( cutResultGeometry, dresserMaterial );
		newDresser.applyMatrix(furniture_cutToChair.matrixWorld);
		// newDresser.position.set(position.x, position.y, position.z);
		// furniture_cutToChair.worldToLocal(newDresser.position);
		//furniture_cutToChair.remove(cube);
		//this.main.scene.remove(furniture_cutToChair);
		this.main.scene.add(newDresser);
		
	},

	addLegEvent: function() {
		// body...
		var furniture_addLeg = new THREE.Object3D();
		furniture_addLeg = this.furnitures[0].getFurniture().clone();

	},

	addDoorEvent: function() {
		// body...
		var furniture_addDoor = new THREE.Object3D();
		furniture_addDoor = this.furnitures[0].getFurniture().clone();
	},

	addRodEvent: function(){
		var furniture_addRod = new THREE.Object3D();
		furniture_addRod = this.furnitures[0].getFurniture().clone();
	},

	addSpiceRackEvent: function(){
		var furniture_addSpiceRack = new THREE.Object3D();
		furniture_addSpiceRack = this.furnitures[0].getFurniture().clone();
	},

	addDrawerEvent: function() {
		// body...
		var furniture_addDrawer = new THREE.Object3D();
		furniture_addDrawer = this.furnitures[0].getFurniture().clone();
	},

	changeHandlesEvent: function() {
		// body...
		var furniture_changeHandles = new THREE.Object3D();
		furniture_changeHandles = this.furnitures[0].getFurniture().clone();
	},

	removeDrawersEvent: function() {
		// body...
		var furniture_removeDrawers = new THREE.Object3D();
		furniture_removeDrawers = this.furnitures[0].getFurniture().clone();
	},

	execute: function(){
		// console.log(this.furnitures[0]);
		if(this.checkHasTopFront(this.furnitures[0])){
			this.cutToChairEvent();
			// this.addLegEvent();
			// this.addDoorEvent();
			// this.addRodEvent();
			// this.addSpiceRackEvent();
			// this.addDrawerEvent();
			// this.changeHandlesEvent();
			// this.removeDrawersEvent();
			// console.log("123");
		}
		else{
			alert("Please mark cabinetTop and cabinetFront");
		}
		
	}
}

module.exports = Dresser_Add