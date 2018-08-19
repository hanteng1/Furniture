"use strict;"

const dresserCutSpace = require('./dresserCutSpace')
const chairCreateBoard = require('./chairCreateBoard')
const CreateRod = require('./CreateRod')

function Dresser_Add (main){
	this.main = main;
	this.furnitures = main.furnitures;

}


Dresser_Add.prototype = {

	loadClothesHanger: function(rod) {
		var clothesHanger;
		var scene = this.main.scene;
		var Dresser_Add = this;
		var loadingManager = new THREE.LoadingManager( function() {
			
			// clothesHanger.rotateY(90);
			clothesHanger.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), 3.14/2);
			clothesHanger.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 3.14/2);
			// scene.add(clothesHanger);
			// var clothesHangerCenter = Dresser_Add.getPartCenter(clothesHanger);
			var clothesHangerSize = Dresser_Add.getPartSize(clothesHanger);

			var rodCenter = Dresser_Add.getPartCenter(rod);
			var rodSize = Dresser_Add.getPartSize(rod);

			clothesHanger.position.set(rodCenter.x, rodCenter.y - clothesHangerSize.y + rodSize.y/2, rodCenter.z);
			rod.worldToLocal(clothesHanger.position);

			rod.add(clothesHanger);
		} );
		var loader = new THREE.ColladaLoader( loadingManager );			
			loader.load( "./models/chothesHanger/model.dae", function ( collada ) {
			clothesHanger = collada.scene;
			clothesHanger.name = "clothesHanger";
			clothesHanger.scale.x = 0.75; clothesHanger.scale.y = 0.75; clothesHanger.scale.z = 0.75;
			
		} );
	},

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

	addShelf: function(furniture, spaceCenter, spaceSize){
		var dresser = furniture.getObjectByName("Dresser");

		// console.log("dresser");
		// console.log(dresser);

		var raycaster = new THREE.Raycaster();
		var pos = spaceCenter.clone();
		pos.y = pos.y - spaceSize.y/2;
		raycaster.set(pos, new THREE.Vector3(0,-1,0));

		var intersects = raycaster.intersectObject(dresser);
		if(intersects.length > 0){
			// console.log("intersects[0].point");
			// console.log(intersects[0].point);
			// console.log("pos.y");
			// console.log(pos.y);
			if(intersects[0].point.y > pos.y - 0.1){
				console.log("Dresser shelf exit.");
				return;
			}
		}
		console.log("Dresser no shelf.");

		//get dresser material case1: no children case2: has children

		var material = this.getPartMaterial(dresser);

		var geometry = chairCreateBoard(spaceSize.z, 0.1, spaceSize.x);
		var shelf = new THREE.Mesh(geometry, material);
		var shelfSize = this.getPartSize(shelf);
		var shelf_inverse = new THREE.Matrix4();
		shelf_inverse.getInverse(furniture.matrixWorld);
		shelf.applyMatrix(shelf_inverse);

		shelf.position.set(pos.x - shelfSize.x/2, pos.y, pos.z - shelfSize.z/2);
		furniture.worldToLocal(shelf.position);

		furniture.add(shelf);
		// this.main.scene.add(shelf);
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

	getPartMaterial: function(obj) {
		var material = new THREE.Material();
		if(obj.children.length > 0){
			var child = obj.children[0];
			while(child.children.length)
				child = child.children[0];
			if (Array.isArray(child.material))
				material = child.material[0];			
			else
				material = child.material;
		}
		else{
			if (Array.isArray(obj.material))
				material = obj.material[0];			
			else
				material = obj.material;			
		}

		return material;
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

	removeDrawersByColumn: function(furniture, removeNumber){
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
		if(removeNumber <= count.length){
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


			// var boxHelper = new THREE.Box3Helper(space, 0x000000);
			// this.main.scene.add(boxHelper);

			for(var i = 0; i < removeNumber; i++){
				for (var j = 0; j < centers.length; j++) {
					if(count[i] == centers[j]){
						// console.log("remove!!");
						furniture.remove(drawers[j]);
					}
				}				
			}
			var inverse = new THREE.Matrix4();
			inverse.getInverse(furniture.matrixWorld);
			space.applyMatrix4(inverse);
			return space;
		}
		else
			console.log("Remove columns fail.");
	},

	cutToChairEvent: function() {

		var furniture_cutToChair = new THREE.Object3D();
		furniture_cutToChair = this.furnitures[0].getFurniture().clone();
		this.main.scene.add(furniture_cutToChair);

		this.markCabinet(furniture_cutToChair);		
		this.markDrawer(furniture_cutToChair);
		// console.log("furniture_cutToChair");
		// console.log(furniture_cutToChair);

		var parameter = 4;
		var spaceBox = this.removeDrawersByColumn(furniture_cutToChair, parameter);
		
		var size = new THREE.Vector3();
		var position = new THREE.Vector3();


		var dresser = furniture_cutToChair.getObjectByName("Dresser");
		// console.log("dresser");
		// console.log(dresser);

		// var geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
		// var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
		// var cube = new THREE.Mesh( geometry, material );
		// var dresser_matrix = new THREE.Matrix4();
		// dresser_matrix.getInverse(dresser.matrixWorld, true);
		// cube.applyMatrix(dresser_matrix);
		// cube.position.set(position.x, position.y, position.z);
		// dresser.worldToLocal(cube.position);
		// dresser.add(cube);

		// console.log("cube");
		// console.log(cube);
		// var verticesAttribute = dresser.geometry.getAttribute('position');
		// var verticesArray = verticesAttribute.array;
		// var itemSize = verticesAttribute.itemSize;
		// var verticesNum = verticesArray.length / itemSize;
		// var beforeLength = verticesNum;
		// var modifer = new THREE.SimplifyModifier();
		// var simplified = modifer.modify( dresser.geometry,  beforeLength * 0.5 | 0 );
		// console.log(simplified);

		// if(dresser.children.length > 0){
		// 	var tmp = dresser.children[0];
		// 	while(this.hasChildren(tmp))
		// 		tmp = tmp.children[0];
		// }
		// else{
		// 	var tmp = new THREE.Object3D;
		// 	tmp = dresser;
		// }
		
		// var dresserMaterial = new THREE.MeshBasicMaterial();
		// if (Array.isArray(tmp.material))
		// 	dresserMaterial = tmp.material[0].clone();
		// else
		// 	dresserMaterial = tmp.material.clone();

		// console.log("simplified");
		// console.log(simplified);
		// var cutResultGeometry = dresserCutSpace(simplified, position, size, cube.scale);
		// var cutResultGeometry = dresserCutSpace(simplified);
		

		// var newDresser = new THREE.Mesh( cutResultGeometry, dresserMaterial );
		// var scale = dresser.scale;
		// newDresser.scale.set(scale.x, scale.y, scale.z);
		// console.log(newDresser);
		// newDresser.applyMatrix(dresser.matrixWorld);
		// newDresser.position.set(position.x, position.y, position.z);
		// furniture_cutToChair.worldToLocal(newDresser.position);
		//furniture_cutToChair.remove(cube);
		// this.main.scene.remove(furniture_cutToChair);

		// var test = new THREE.Box3();
		// test.setFromObject(newDresser);
		// var testHelper = new THREE.Box3Helper(test, 0x000000);
		// this.main.scene.add(testHelper);

		// this.main.scene.add(newDresser);
		
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
		console.log("this.furnitures.length");
		console.log(this.furnitures.length);
		if(this.furnitures.length == 1){
			var furniture_addRod = this.furnitures[0].getFurniture();
			this.markCabinet(furniture_addRod);		
			this.markDrawer(furniture_addRod);

			var parameter = 6;
			var spaceBox = this.removeDrawersByColumn(furniture_addRod, parameter);
			var spaceSize = new THREE.Vector3();
			var spaceCenter = new THREE.Vector3();


			spaceBox.getSize(spaceSize);
			spaceBox.getCenter(spaceCenter);
			furniture_addRod.localToWorld(spaceCenter);
			
			this.addShelf(furniture_addRod, spaceCenter, spaceSize);

			var dresser = furniture_addRod.getObjectByName("Dresser");
			var rodMaterial = this.getPartMaterial(dresser);
			var rodGeometry = CreateRod(spaceSize.z);
			var rod = new THREE.Mesh(rodGeometry, rodMaterial);
			rod.name = "rod";
			
			this.loadClothesHanger(rod);

			var furniture_addRod_inverse = new THREE.Matrix4();
			furniture_addRod_inverse.getInverse(furniture_addRod.matrixWorld);
			rod.applyMatrix(furniture_addRod_inverse);

			rod.position.set(spaceCenter.x, spaceCenter.y + spaceSize.y/3, spaceCenter.z);
			furniture_addRod.worldToLocal(rod.position);

			furniture_addRod.add(rod);
		}
		else{
			var furnitureSize = this.getPartSize(this.furnitures[0].getFurniture());
			var furnitureCenter = this.getPartCenter(this.furnitures[0].getFurniture());
			//align
			for (var i = 0, offest = 0; i < this.furnitures.length; i++, offest+=furnitureSize.x*2) {
				var furniture_addRod = this.furnitures[i].getFurniture();
				this.markCabinet(furniture_addRod);		
				this.markDrawer(furniture_addRod);
				furniture_addRod.position.set(offest, 0, 0);
			}

			//add rod
			var furniture_addRod = this.furnitures[0].getFurniture();
			var dresser = furniture_addRod.getObjectByName("Dresser");
			var rodMaterial = this.getPartMaterial(dresser);

			for (var i = 0, offest = furnitureSize.x; i < this.furnitures.length - 1; i++, offest += furnitureSize.x*2) {
				var rodGeometry = CreateRod(furnitureSize.x);
				var rod = new THREE.Mesh(rodGeometry, rodMaterial);
				rod.name = "rod";
				rod.position.set(offest, furnitureCenter.y + furnitureSize.y/4, 0);
				this.main.scene.add(rod);
				this.loadClothesHanger(rod);
				
			}
		}
		
	},

	addSpiceRackEvent: function(){
		var furniture_addSpiceRack = new THREE.Object3D();
		furniture_addSpiceRack = this.furnitures[0].getFurniture();

		var furnitureSize = this.getPartSize(furniture_addSpiceRack);
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
		var furniture_removeDrawer = new THREE.Object3D();
		furniture_removeDrawer = this.furnitures[0].getFurniture().clone();
		this.main.scene.add(furniture_removeDrawer);

		this.markCabinet(furniture_removeDrawer);		
		this.markDrawer(furniture_removeDrawer);

		// console.log("furniture_removeDrawer");
		// console.log(furniture_removeDrawer);

		var parameter = 2;
		var spaceBox = this.removeDrawersByColumn(furniture_removeDrawer, parameter);
		
		var spaceSize = new THREE.Vector3();
		var spaceCenter = new THREE.Vector3();

		spaceBox.getSize(spaceSize);
		spaceBox.getCenter(spaceCenter);
		
		this.addShelf(furniture_removeDrawer, spaceCenter, spaceSize);

		//furniture_removeDrawer.position.set(20,0,0);
	},

	execute: function(){
		// console.log(this.furnitures[0]);
		if(this.checkHasTopFront(this.furnitures[0])){
			//this.cutToChairEvent();
			// this.addLegEvent();
			// this.addDoorEvent();
			// this.addRodEvent();
			this.addSpiceRackEvent();
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