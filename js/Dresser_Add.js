"use strict;"

const dresserCutSpace = require('./dresserCutSpace')
const chairCreateBoard = require('./chairCreateBoard')
const CreateRod = require('./CreateRod')
const CreateDoor = require('./CreateDoor')
const CreateChain = require('./CreateChain')
const CreateHinge = require('./CreateHinge')
const CreateSpiceRack = require('./CreateSpiceRack')
const CreateDresserLeg = require('./CreateDresserLeg')
const CreateDrawer = require('./CreateDrawer')
const CreateBlum = require('./CreateBlum')

function Dresser_Add (main){
	this.main = main;
	this.furnitures = main.furnitures;

	// remove drawer flag
	this.hasRemovedDrawers = false;
	// remove drawers number 
	this.parameter = 3;

	// door event
	// this.mode = "upToDown";
	this.mode = "leftToRight";
	this.RAngle = 70;

	// add drawer
	// this.drawerMode = "vertical";
	this.drawerMode = "horizontal";
	this.drawerParameter = 3;
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
		var str1 = "cFront-cTop";
		var str2 = "cTop-cFront";
		for (var i = 0; i < obj.children.length; i++) {
			if(obj.children[i].name == str1 || obj.children[i].name == str2)
				return true;			
		}
		return false;
	},

	hasChildren: function(obj) {
		if (obj.children.length != 0)
			return true;
		return false;		
	},

	addBottom: function(dresser, size, center) {
		var material = this.getPartMaterial(dresser);
		var geometry = chairCreateBoard(size.x - 0.6, 0.1, size.z - 0.6);
		var bottom = new THREE.Mesh(geometry, material);
		bottom.name = "Dresser_part_bottom";
		var tmp = new THREE.Vector3(center.x - size.x/2, center.y - size.y/2, center.z - size.z/2);
		var inverse = new THREE.Matrix4();
		inverse.getInverse(dresser.matrixWorld);
		dresser.worldToLocal(tmp);
		bottom.applyMatrix(inverse);
		bottom.position.set(tmp.x, tmp.y, tmp.z);
		dresser.add(bottom);
	},

	hasBottom: function(obj){
		var dresser = obj.getObjectByName("Dresser");
		var center = this.getPartCenter(dresser);
		var size = this.getPartSize(dresser);
		var origin = new THREE.Vector3(center.x, center.y - size.y, center.z);
		var direction = new THREE.Vector3(0,1,0);
		var intersects = this.getPointByRay(dresser, origin, direction);
		if(intersects.length > 0){
			var pos = intersects[0].point;
			if(pos.y > center.y){
				console.log("add bottom");				
				this.addBottom(dresser, size, center);
			}
			return;
		}
		console.log("bottom ray miss");
		this.addBottom(dresser, size, center);
	},

	addBack: function(dresser, size, center) {
		var material = this.getPartMaterial(dresser);
		var geometry = chairCreateBoard(size.x - 0.6, size.y - 0.6, 0.1);
		var back = new THREE.Mesh(geometry, material);
		back.name = "Dresser_part_back";
		var tmp = new THREE.Vector3(center.x - size.x/2 + 0.3, center.y - size.y/2 + 0.3, center.z - size.z/2);
		var inverse = new THREE.Matrix4();
		inverse.getInverse(dresser.matrixWorld);
		dresser.worldToLocal(tmp);
		back.applyMatrix(inverse);
		back.position.set(tmp.x, tmp.y, tmp.z);
		dresser.add(back);
	},

	hasBack: function(obj){
		var dresser = obj.getObjectByName("Dresser");
		var center = this.getPartCenter(dresser);
		var size = this.getPartSize(dresser);
		var origin = new THREE.Vector3(center.x, center.y, center.z - size.z);
		var direction = new THREE.Vector3(0,0,1);
		var intersects = this.getPointByRay(dresser, origin, direction);
		if(intersects.length > 0){
			var pos = intersects[0].point;
			if(pos.z > center.z){
				console.log("add back");				
				this.addBack(dresser, size, center);
			}
			return;
		}
		console.log("back ray miss");
		this.addBack(dresser, size, center);
	},

	addShelf: function(furniture, spaceCenter, spaceSize) {
		var dresser = furniture.getObjectByName("Dresser");
		var material = this.getPartMaterial(dresser);

		var geometry = chairCreateBoard(spaceSize.x - 0.6, 0.1, spaceSize.z - 0.6);
		var shelf = new THREE.Mesh(geometry, material);
		var shelfSize = this.getPartSize(shelf);
		var shelf_inverse = new THREE.Matrix4();
		shelf_inverse.getInverse(dresser.matrixWorld);
		shelf.applyMatrix(shelf_inverse);

		shelf.position.set(spaceCenter.x - spaceSize.x/2, spaceCenter.y - spaceSize.y/2, 
			spaceCenter.z - spaceSize.z/2);
		dresser.worldToLocal(shelf.position);

		dresser.add(shelf);
	},

	createTheDrawer: function(drawerMaterial, blumsMaterial, size){
		if(this.drawerMode == "vertical"){
			var geometry = CreateDrawer(size.x, size.z, size.y/2);
			var drawer = new THREE.Mesh(geometry, drawerMaterial);
			drawer.name = "drawer";

			var blumsGeometry = CreateBlum(size.x, size.z, size.y/2);
			var blums = new THREE.Mesh(blumsGeometry, blumsMaterial);
			blums.name = "blums";
		}
		else if(this.drawerMode == "horizontal"){
			var geometry = CreateDrawer(size.x/2 - 0.5, size.z, size.y);
			var drawer = new THREE.Mesh(geometry, drawerMaterial);
			drawer.name = "drawer";

			var blumsGeometry = CreateBlum(size.x/2 - 0.5, size.z, size.y);
			var blums = new THREE.Mesh(blumsGeometry, blumsMaterial);
			blums.name = "blums";
		}
		drawer.add(blums);
		return drawer;
	},

	getPartCenter: function(obj) {
		var vector = new THREE.Vector3();
		var box = new THREE.Box3();
		box.setFromObject(obj);
		box.getCenter(vector);
		return vector;
	},

	getPartSize: function(obj) {
		var vector = new THREE.Vector3();
		var box = new THREE.Box3();
		box.setFromObject(obj);
		box.getSize(vector);
		return vector;
	},

	getPointByRay: function(obj, origin, direction) {
		var raycaster = new THREE.Raycaster();
		raycaster.set(origin, direction);
		if(obj.children.length > 0){
			var array = new Array();
			this.getAllChildren(obj, array);
			var intersects = raycaster.intersectObjects(array);
		}
		else
			var intersects = raycaster.intersectObject(obj);
		return intersects;
	},

	getInsideSpace: function(obj) {
		var dresser = obj.getObjectByName("Dresser");
		var center = this.getPartCenter(dresser);
		var size = this.getPartSize(dresser);
		var space = new THREE.Box3();
		space.setFromObject(dresser);
		var maxX, maxY, maxZ, minX, minY, minZ;		

		var originRL = new THREE.Vector3(center.x + size.x, center.y, center.z);
		var directionRL = new THREE.Vector3(-1,0,0);
		var rayRL = this.getPointByRay(dresser, originRL, directionRL);
		if(rayRL.length > 0){
			minX = rayRL[rayRL.length - 1].point;
			space.min.x = minX.x;		
		}
		else
			console.log("rayRL miss");

		var originLR = new THREE.Vector3(center.x - size.x, center.y, center.z);
		var directionLR = new THREE.Vector3(1,0,0);
		var rayLR = this.getPointByRay(dresser, originLR, directionLR);
		if(rayLR.length > 0){
			maxX = rayLR[rayLR.length - 1].point;
			space.max.x = maxX.x;
		}
		else
			console.log("rayLR miss");	

		var originFB = new THREE.Vector3(center.x, center.y, center.z + size.z);
		var directionFB = new THREE.Vector3(0,0,-1);
		var rayFB = this.getPointByRay(dresser, originFB, directionFB);
		if(rayFB.length > 0){
			minZ = rayFB[rayFB.length - 1].point;
			space.min.z = minZ.z;
		}
		else
			console.log("rayFB miss");

		originFB = new THREE.Vector3(space.max.x + 0.1, center.y, center.z + size.z);
		var rayFB = this.getPointByRay(dresser, originFB, directionFB);
		if(rayFB.length > 0){
			maxZ = rayFB[0].point;
			space.max.z = maxZ.z;
		}
		else
			console.log("rayFB(2) miss");

		var originUD = new THREE.Vector3(center.x, center.y, space.max.z + 0.1);
		var directionUD = new THREE.Vector3(0,-1,0);
		var rayUD = this.getPointByRay(dresser, originUD, directionUD);
		if(rayUD.length > 0){
			minY = rayUD[0].point;
			space.min.y = minY.y;
		}
		else{
			console.log("rayUD1 miss");
			rayUD = [];
			originUD = new THREE.Vector3(center.x, center.y, space.max.z - 0.1);
			rayUD = this.getPointByRay(dresser, originUD, directionUD);
			if(rayUD.length > 0){
				maxY = rayUD[0].point;
				space.max.y = maxY.y;
			}
			else
				console.log("rayUD2 miss");
		}

		var originDU = new THREE.Vector3(center.x, center.y, space.max.z + 0.1);
		var directionDU = new THREE.Vector3(0,1,0);
		var rayDU = this.getPointByRay(dresser, originDU, directionDU);
		if(rayDU.length > 0){
			maxY = rayDU[0].point;
			space.max.y = maxY.y;
		}
		else{
			console.log("rayDU1 miss");
			rayDU = [];
			originDU = new THREE.Vector3(center.x, center.y, space.max.z - 0.1);
			rayDU = this.getPointByRay(dresser, originDU, directionDU);
			if(rayDU.length > 0){
				maxY = rayDU[0].point;
				space.max.y = maxY.y;
			}
			else
				console.log("rayDU2 miss");
		}

		return space;
	},

	getAllChildren: function(obj, array) {
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

	getAllCorners: function(obj) {
		// 0-----1   4-----5
		// | up  |   | down|
		// |     |   |     |
		// 3-----2   7-----6

		var corners = new Array();
		var center = this.getPartCenter(obj);
		var size = this.getPartSize(obj);

		//0
		var point0 = new THREE.Vector3();
		point0.x = center.x - size.x/2;
		point0.y = center.y + size.y/2;
		point0.z = center.z - size.z/2;
		corners.push(point0);

		//1
		var point1 = new THREE.Vector3();
		point1.x = center.x + size.x/2;
		point1.y = center.y + size.y/2;
		point1.z = center.z - size.z/2;
		corners.push(point1);

		//2
		var point2 = new THREE.Vector3();
		point2.x = center.x + size.x/2;
		point2.y = center.y + size.y/2;
		point2.z = center.z + size.z/2;
		corners.push(point2);

		//3
		var point3 = new THREE.Vector3();
		point3.x = center.x - size.x/2;
		point3.y = center.y + size.y/2;
		point3.z = center.z + size.z/2;
		corners.push(point3);

		//4
		var point4 = new THREE.Vector3();
		point4.x = center.x - size.x/2;
		point4.y = center.y - size.y/2;
		point4.z = center.z - size.z/2;
		corners.push(point4);

		//5
		var point5 = new THREE.Vector3();
		point5.x = center.x + size.x/2;
		point5.y = center.y - size.y/2;
		point5.z = center.z - size.z/2;
		corners.push(point5);

		//6
		var point6 = new THREE.Vector3();
		point6.x = center.x + size.x/2;
		point6.y = center.y - size.y/2;
		point6.z = center.z + size.z/2;
		corners.push(point6);

		//7
		var point7 = new THREE.Vector3();
		point7.x = center.x - size.x/2;
		point7.y = center.y - size.y/2;
		point7.z = center.z + size.z/2;
		corners.push(point7);

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

	markCabinet: function(furniture) {
		var obj = furniture.getObjectByName("cTop-cFront");
		if(typeof obj == 'undefined')
			obj = furniture.getObjectByName("cFront-cTop");

		if(typeof obj == 'undefined'){
			obj = furniture.getObjectByName("Dresser");
			if (typeof obj == 'undefined')
				console.log("markCabinet fail: Can't find key word.");
			else
				console.log("have marked Cabinet.");
			return;
		}			
			

		if(obj.children.length > 0){
			for (var i = 0; i < obj.children.length; i++) {
				obj.children[i].name = "Dresser_part";
			}
		}		
		obj.name = "Dresser";	
	},

	markDrawer: function(furniture) {
		var children = new Array();
		this.getAllChildren( furniture, children );
		// console.log(children);

		var checkbox = new THREE.Box3();
		checkbox.setFromObject(furniture.getObjectByName("Dresser"));
		// var boxHelper = new THREE.Box3Helper(checkbox, 0x000000);
		var drawers = [];
		for(var i = 0; i < children.length ; i++){
			var box = new THREE.Box3();
			box.setFromObject(children[i]);
			// boxHelper = new THREE.Box3Helper(box, 0x000000);
			// this.main.scene.add(boxHelper);
			if(children[i].name == ""){
				if(checkbox.intersectsBox(box)){
					children[i].name = "drawer";
					drawers.push(children[i]);
				}
			}			
		}

		// console.log("drawers.length");
		// console.log(drawers.length);
		for (var i = 0; i < drawers.length; i++) {
			var checkbox = new THREE.Box3();
			checkbox.setFromObject(drawers[i]);
			checkbox.max.z += 2;			
			for (var j = 0; j < children.length; j++) {
				if(children[j].name == ""){
					var box = new THREE.Box3();
					box.setFromObject(children[j]);
					if(checkbox.intersectsBox(box)){
						children[j].name = "drawer";						
					}
				}
			}			
		}		
	},

	countDrawerByColumn: function(furniture, count) {
		var drawers = new Array();
		for (var i = 0; i < furniture.children.length; i++)
			if(furniture.children[i].name == "drawer")
				drawers.push(furniture.children[i]);
		
		var centers = new Array();
		for (var i = 0; i < drawers.length; i++)
			centers.push(Math.floor(this.getPartCenter(drawers[i]).y * 100)/100);

		var centers_clone = centers.slice(0);
		centers_clone.sort(function(a, b){return b-a});

		count.push(centers_clone[0]);
		for (var i = 1; i < centers_clone.length; i++) {
			if(centers_clone[i] <= centers_clone[i-1] - 2)
				count.push(centers_clone[i]);
		}
	},

	removeDrawersByColumn: function(furniture, removeNumber, count) {
		this.countDrawerByColumn(furniture, count);

		console.log(count);

		var drawers = new Array();
		for (var i = 0; i < furniture.children.length; i++)
			if(furniture.children[i].name == "drawer")
				drawers.push(furniture.children[i]);
		
		var centers = new Array();
		for (var i = 0; i < drawers.length; i++)
			centers.push(Math.floor(this.getPartCenter(drawers[i]).y * 100)/100);
		
		console.log(centers);

		if(removeNumber <= count.length){
			for(var i = 0; i < removeNumber; i++)
				for (var j = 0; j < centers.length; j++)
					if(count[i] >= centers[j] && count[i]-2 <= centers[j])
						furniture.remove(drawers[j]);
		}
		else
			console.log("Remove columns fail.");
	},

	cutToChairEvent: function() {
		var furniture_cutToChair = new THREE.Object3D();
		furniture_cutToChair = this.furnitures[0].getFurniture();

		this.markCabinet(furniture_cutToChair);
		this.markDrawer(furniture_cutToChair);
		var dresser = furniture_cutToChair.getObjectByName("Dresser");
		this.hasBottom(dresser);
		this.hasBack(dresser);
		
	},

	addLegEvent: function() {
		var furniture_addLeg = new THREE.Object3D();
		furniture_addLeg = this.furnitures[0].getFurniture();

		this.markCabinet(furniture_addLeg);
		this.markDrawer(furniture_addLeg);
		var dresser = furniture_addLeg.getObjectByName("Dresser");
		this.hasBottom(furniture_addLeg);
		this.hasBack(furniture_addLeg);
		
		// 0-----1   4-----5
		// | up  |   | down|
		// |     |   |     |
		// 3-----2   7-----6
		var corners = this.getAllCorners(dresser);

		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture_addLeg.matrixWorld);
		
		var material = this.getPartMaterial(dresser);
		var legGeometry = CreateDresserLeg();
		var leg = new THREE.Mesh(legGeometry, material);
		leg.name = "leg";
		var legsArray = [4];
		for(var i=0; i<4; i++)
			legsArray[i] = leg.clone();

		var dresserSize = this.getPartSize(dresser);
		var legSize = this.getPartSize(leg);
		var direction = new THREE.Vector3(0,1,0);
		for(var i=4; i<=7; i++){
			var pos = corners[i];
			// console.log(corners[i]);
			pos.y -= 10;
			if(i == 4 || i == 7)
				pos.x += dresserSize.x/5;
			if(i == 5 || i == 6)
				pos.x -= dresserSize.x/5;
			if(i == 4 || i == 5)
				pos.z += dresserSize.z/5;
			if(i == 6 || i == 7)
				pos.z -= dresserSize.z/5;
			// console.log(corners[i]);
			var ray = this.getPointByRay(dresser, pos, direction);
			if(ray.length > 0){
				var pos = new THREE.Vector3(ray[0].point.x, ray[0].point.y - legSize.y/2, ray[0].point.z);

				legsArray[i-4].applyMatrix(inverse);
				furniture_addLeg.worldToLocal(pos);
				legsArray[i-4].position.set(pos.x, pos.y, pos.z);
				furniture_addLeg.add(legsArray[i-4]);
			}
			else{
				console.log("Ray miss");
			}
		}		
	},

	addDoorEvent: function() {
		var furniture_addDoor = new THREE.Object3D();
		furniture_addDoor = this.furnitures[0].getFurniture();

		this.markCabinet(furniture_addDoor);		
		this.markDrawer(furniture_addDoor);
		var dresser = furniture_addDoor.getObjectByName("Dresser");
		this.hasBottom(dresser);
		this.hasBack(dresser);
		// console.log("furniture_addDoor");
		// console.log(furniture_addDoor);
		var dresserSize = this.getPartSize(dresser);
		var dresserCenter = this.getPartCenter(dresser);
		var doorMaterial = this.getPartMaterial(dresser);

		var count = new Array();
		
		if(!this.hasRemovedDrawers){
			spaceBox = this.removeDrawersByColumn(furniture_addDoor, this.parameter, count);
			if(this.parameter > count.length){
				var tmp = new Array();
				this.parameter = count.length;
				this.removeDrawersByColumn(furniture_addDoor, this.parameter, tmp);				
			}
			this.hasRemovedDrawers = true;
		}

		var spaceBox = new THREE.Box3();
		spaceBox = this.getInsideSpace(furniture_addDoor);
		if(this.parameter < count.length){
			var offest = (spaceBox.max.y - spaceBox.min.y) / count.length;
			spaceBox.min.y += offest * (count.length - this.parameter);
		}

		var spaceSize = new THREE.Vector3();
		var spaceCenter = new THREE.Vector3();
		spaceBox.getSize(spaceSize);
		spaceBox.getCenter(spaceCenter);

		spaceCenter.y = spaceCenter.y + spaceSize.y/4;
		spaceSize.y = spaceSize.y/2;
		this.addShelf(furniture_addDoor, spaceCenter, spaceSize);

		
		spaceBox.getSize(spaceSize);
		spaceBox.getCenter(spaceCenter);

		//left to right
		if(this.mode == "leftToRight"){
			var doorGeometry = CreateDoor(spaceSize.y, spaceSize.x + 1);
			var door = new THREE.Mesh(doorGeometry, doorMaterial);
			door.name = "door";
			var doorSize = this.getPartSize(door);

			var angle = this.RAngle/180*Math.PI;

			var offsetZ = spaceSize.x/2 * Math.sin(angle) + 0.8 * Math.cos(angle);

			
			var offsetX = -1 * spaceSize.x/2 * Math.cos(angle) + 0.5 * Math.sin(angle);
			

			var doorpos = new THREE.Vector3(spaceCenter.x + spaceSize.x/2 + offsetX, spaceCenter.y, 
				spaceCenter.z + spaceSize.z/2  + offsetZ);

			var inverse = new THREE.Matrix4();
			inverse.getInverse(furniture_addDoor.matrixWorld);
			door.applyMatrix(inverse);
			furniture_addDoor.worldToLocal(doorpos);
			door.position.set(doorpos.x, doorpos.y, doorpos.z);
			furniture_addDoor.add(door);
			door.rotateY(angle);

			var hingeGeometry = CreateHinge(this.RAngle-90, this.mode);			
			var hinge1 = new THREE.Mesh(hingeGeometry, doorMaterial);
			hinge1.name = "hinge";
			var hinge2 = hinge1.clone();
			var hinge1pos = new THREE.Vector3(spaceCenter.x + spaceSize.x/2 - 0.3, 
				spaceCenter.y + spaceSize.y/4, spaceCenter.z + spaceSize.z/2);
			var hinge2pos = new THREE.Vector3(spaceCenter.x + spaceSize.x/2 - 0.3, 
				spaceCenter.y - spaceSize.y/4, spaceCenter.z + spaceSize.z/2);

			hinge1.applyMatrix(inverse);
			hinge2.applyMatrix(inverse);
			furniture_addDoor.worldToLocal(hinge1pos);
			furniture_addDoor.worldToLocal(hinge2pos);
			hinge1.position.set(hinge1pos.x, hinge1pos.y, hinge1pos.z);
			hinge2.position.set(hinge2pos.x, hinge2pos.y, hinge2pos.z);
			furniture_addDoor.add(hinge1);
			furniture_addDoor.add(hinge2);
		}

		//up to down
		if(this.mode == "upToDown"){
			var doorGeometry = CreateDoor(spaceSize.x, spaceSize.y);
			var door = new THREE.Mesh(doorGeometry, doorMaterial);	
			door.name = "door";		
			door.rotateZ(-90/180*Math.PI);
			var doorSize = this.getPartSize(door);
			
			var angle = this.RAngle/180*Math.PI ;
			var offsetY = doorSize.y/2 * Math.cos(angle) - 0.8 * Math.sin(angle);
			
			var offsetZ = doorSize.y/2 * Math.sin(angle) + 0.8 * Math.cos(angle);

			var doorpos = new THREE.Vector3(spaceCenter.x, 
				spaceCenter.y - doorSize.y/2 + offsetY , spaceCenter.z + spaceSize.z/2 + offsetZ);
			var tmp = new THREE.Vector3();
			tmp.set(doorpos.x, doorpos.y, doorpos.z);

			var inverse = new THREE.Matrix4();
			inverse.getInverse(furniture_addDoor.matrixWorld);
			door.applyMatrix(inverse);
			furniture_addDoor.worldToLocal(doorpos);
			door.position.set(doorpos.x, doorpos.y, doorpos.z);
			furniture_addDoor.add(door);
			door.rotateY(angle);		

			var hingeGeometry = CreateHinge(this.RAngle-90, this.mode);			
			var hinge1 = new THREE.Mesh(hingeGeometry, doorMaterial);			
			hinge1.name = "hinge";
			// var offest = ((dresserSize.y - 1)/2) * (-1) *Math.cos(angle) + 0.8;
			var hinge1pos = new THREE.Vector3(spaceCenter.x + spaceSize.x/4, 
				spaceCenter.y - spaceSize.y/2 + 0.7, spaceCenter.z + spaceSize.z/2 );

			var hinge2 = hinge1.clone();
			var hinge2pos = new THREE.Vector3(spaceCenter.x - spaceSize.x/4, 
				spaceCenter.y - spaceSize.y/2 + 0.7, spaceCenter.z + spaceSize.z/2 );

			hinge1.applyMatrix(inverse);
			furniture_addDoor.worldToLocal(hinge1pos);
			hinge1.position.set(hinge1pos.x, hinge1pos.y, hinge1pos.z);
			furniture_addDoor.add(hinge1);

			hinge2.applyMatrix(inverse);
			furniture_addDoor.worldToLocal(hinge2pos);
			hinge2.position.set(hinge2pos.x, hinge2pos.y, hinge2pos.z);
			furniture_addDoor.add(hinge2);
		}
	},

	addRodEvent: function() {
		if(this.furnitures.length == 1){
			var furniture_addRod = this.furnitures[0].getFurniture();
			this.markCabinet(furniture_addRod);		
			this.markDrawer(furniture_addRod);
			var dresser = furniture_addRod.getObjectByName("Dresser");
			this.hasBottom(furniture_addRod);
			this.hasBack(furniture_addRod);

			var count = new Array();
			if(!this.hasRemovedDrawers){
				this.removeDrawersByColumn(furniture_addRod, this.parameter, count);
				if(count.length < this.parameter){
					this.parameter = count.length;
					var tmp = [];
					this.removeDrawersByColumn(furniture_addRod, this.parameter, tmp);
				}
				this.hasRemovedDrawers = true;
			}

			var spaceBox = this.getInsideSpace(furniture_addRod);

			if(this.parameter < count.length){
				var offest = (spaceBox.max.y - spaceBox.min.y) / count.length;
				spaceBox.min.y += offest * (count.length - this.parameter);
			}

			var dresserSize = this.getPartSize(dresser);
			var dresserCenter = this.getPartCenter(dresser);
			var originRight = new THREE.Vector3(dresserCenter.x + dresserSize.x, 
				dresserCenter.y, dresserCenter.z);
			var rayRiToLe = this.getPointByRay(dresser, originRight, new THREE.Vector3(-1,0,0));
			if(rayRiToLe.length > 0)
				var insideLeft = rayRiToLe[rayRiToLe.length - 1].point;
			else
				console.log("insideLeft miss.");

			var originLeft = new THREE.Vector3(dresserCenter.x - dresserSize.x, 
				dresserCenter.y, dresserCenter.z);
			var rayLeToRi = this.getPointByRay(dresser, originLeft, new THREE.Vector3(1,0,0));
			if(rayLeToRi.length > 0)
				var insideRight = rayLeToRi[rayLeToRi.length - 1].point;
			else
				console.log("insideRight miss.");

			spaceBox.max.x = insideRight.x;
			spaceBox.min.x = insideLeft.x;

			var spaceSize = new THREE.Vector3();
			var spaceCenter = new THREE.Vector3();

			spaceBox.getSize(spaceSize);
			spaceBox.getCenter(spaceCenter);
			
			//add rod
			var rodMaterial = this.getPartMaterial(dresser);
			var rodGeometry = CreateRod(spaceSize.x);
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

			for (var i = 0, offest = furnitureSize.x; i < this.furnitures.length - 1;
			 i++, offest += furnitureSize.x*2) {
				var rodGeometry = CreateRod(furnitureSize.x);
				var rod = new THREE.Mesh(rodGeometry, rodMaterial);
				rod.name = "rod";
				rod.position.set(offest, furnitureCenter.y + furnitureSize.y/4, 0);
				this.main.scene.add(rod);
				this.loadClothesHanger(rod);
				
			}
		}	
	},

	addSpiceRackEvent: function() {
		var furniture_addSpiceRack = new THREE.Object3D();
		furniture_addSpiceRack = this.furnitures[0].getFurniture();
		var dresser = furniture_addSpiceRack.getObjectByName("Dresser");
		var furnitureSize = this.getPartSize(dresser);
		var furnitureCenter = this.getPartCenter(dresser);

		this.markCabinet(furniture_addSpiceRack);
		this.markDrawer(furniture_addSpiceRack);

		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture_addSpiceRack.matrixWorld);

		
		var material = this.getPartMaterial(dresser);
		var spiceRackGeometry = CreateSpiceRack(furnitureSize.z * 2 / 3);
		var spiceRackRight = new THREE.Mesh(spiceRackGeometry, material);
		var spiceRackLeft = spiceRackRight.clone();
		var spiceRackSize = this.getPartSize(spiceRackRight);
		var spiceRackRightPosition = new THREE.Vector3(furnitureCenter.x + furnitureSize.x/2 + 
			spiceRackSize.x/2, furnitureCenter.y, furnitureCenter.z);

		spiceRackRight.applyMatrix(inverse);
		furniture_addSpiceRack.worldToLocal(spiceRackRightPosition);
		spiceRackRight.position.set(spiceRackRightPosition.x, 
			spiceRackRightPosition.y, spiceRackRightPosition.z);
		furniture_addSpiceRack.add(spiceRackRight);

		
		var spiceRackLeftPosition = new THREE.Vector3(furnitureCenter.x - furnitureSize.x/2 - spiceRackSize.x/2, 
			furnitureCenter.y, furnitureCenter.z);
		
		spiceRackLeft.applyMatrix(inverse);
		furniture_addSpiceRack.worldToLocal(spiceRackLeftPosition);		
		spiceRackLeft.rotateOnWorldAxis ( new THREE.Vector3(0, 1, 0), Math.PI );
		spiceRackLeft.position.set(spiceRackLeftPosition.x, 
			spiceRackLeftPosition.y, spiceRackLeftPosition.z);
		furniture_addSpiceRack.add(spiceRackLeft);
	},

	addDrawerEvent: function() {
		// body...
		var furniture_addDrawer = new THREE.Object3D();
		furniture_addDrawer = this.furnitures[0].getFurniture();

		this.markCabinet(furniture_addDrawer);
		this.markDrawer(furniture_addDrawer);
		this.hasBottom(furniture_addDrawer);
		this.hasBack(furniture_addDrawer);

		var dresser = furniture_addDrawer.getObjectByName("Dresser");
		var material = this.getPartMaterial(dresser);
		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture_addDrawer.matrixWorld);

		//remove drawers and count drawers
		var columns = new Array();
		this.removeDrawersByColumn(furniture_addDrawer, this.drawerParameter, columns);
		if(columns.length < this.drawerParameter){
			this.drawerParameter = columns.length;
			var tmp = [];
			this.removeDrawersByColumn(furniture_addDrawer, this.drawerParameter, tmp);
		}

		console.log(this.drawerParameter);
		console.log(columns);

		//get work space
		var space = this.getInsideSpace(furniture_addDrawer);
		var offest = (space.max.y - space.min.y) / columns.length;
		space.min.y += offest * (columns.length - this.drawerParameter);
		console.log("space");
		console.log(space);

		//create the drawer object
		var theDrawerBox = new THREE.Box3();
		theDrawerBox.copy(space);	
		theDrawerBox.min.y += offest * (this.drawerParameter - 1);
		console.log("theDrawerBox");
		console.log(theDrawerBox);

		var theDrawerSize = new THREE.Vector3();
		theDrawerBox.getSize(theDrawerSize);
		console.log("theDrawerSize");
		console.log(theDrawerSize);

		var theDrawer = this.createTheDrawer(material, material, theDrawerSize);
		console.log("theDrawer");
		console.log(theDrawer);

		if(this.drawerMode == "vertical"){
			var drawerSize = this.getPartSize(theDrawer);
			var tmp = new THREE.Box3();
			for (var i = 0, move = 3; i < this.drawerParameter; i++) {
				tmp.copy(space);				
				tmp.max.y -= offest * i; 
				tmp.min.y += offest * (this.drawerParameter - i - 1);

				var drawer1 = theDrawer.clone();
				var drawer2 = theDrawer.clone();

				var spaceCenter = new THREE.Vector3();
				var spaceSize = new THREE.Vector3();
				tmp.getCenter(spaceCenter);
				tmp.getSize(spaceSize);
				var drawerpos = new THREE.Vector3(spaceCenter.x - drawerSize.x/2 + 0.25, spaceCenter.y,
				 spaceCenter.z - spaceSize.z/2 + move);
				drawer1.applyMatrix(inverse);
				drawer1.position.set(drawerpos.x, drawerpos.y, drawerpos.z);
				furniture_addDrawer.worldToLocal(drawer1.position);
				
				var drawer2pos = new THREE.Vector3(spaceCenter.x - drawerSize.x/2 + 0.25, 
					spaceCenter.y - spaceSize.y/2, spaceCenter.z - spaceSize.z/2 + move + 2);
				drawer2.applyMatrix(inverse);
				drawer2.position.set(drawer2pos.x, drawer2pos.y, drawer2pos.z);
				furniture_addDrawer.worldToLocal(drawer2.position);
				furniture_addDrawer.add(drawer1);
				furniture_addDrawer.add(drawer2);
			}			
		}
		else if(this.drawerMode == "horizontal"){
			var drawerSize = this.getPartSize(theDrawer);
			var tmp = new THREE.Box3();
			for (var i = 0, move = 3; i < this.drawerParameter; i++) {
				tmp.copy(space);				
				tmp.max.y -= offest * i; 
				tmp.min.y += offest * (this.drawerParameter - i - 1);

				var drawer1 = theDrawer.clone();
				var drawer2 = theDrawer.clone();

				var spaceCenter = new THREE.Vector3();
				var spaceSize = new THREE.Vector3();
				tmp.getCenter(spaceCenter);
				tmp.getSize(spaceSize);

				drawer1.applyMatrix(inverse);
				drawer1.position.set(spaceCenter.x + 0.75, spaceCenter.y - spaceSize.y/2,
				 spaceCenter.z - spaceSize.z/2 + move);
				furniture_addDrawer.worldToLocal(drawer1.position);
				furniture_addDrawer.add(drawer1);

				var MidBoardgeometry = chairCreateBoard(1, spaceSize.y - 0.6, spaceSize.z - 0.6);
				var drawerMidBoard = new THREE.Mesh(MidBoardgeometry, material);
				drawerMidBoard.name = "drawerMidBoard";
				drawerMidBoard.applyMatrix(inverse);
				drawerMidBoard.position.set(spaceCenter.x - 0.5, spaceCenter.y - spaceSize.y/2,
				 spaceCenter.z - spaceSize.z/2);
				furniture_addDrawer.worldToLocal(drawerMidBoard.position);
				furniture_addDrawer.add(drawerMidBoard);

				drawer2.applyMatrix(inverse);
				drawer2.position.set(spaceCenter.x - spaceSize.x/2 + 0.25, spaceCenter.y - spaceSize.y/2,
				 spaceCenter.z - spaceSize.z/2 + move +2);
				furniture_addDrawer.worldToLocal(drawer2.position);
				furniture_addDrawer.add(drawer2);
			}
		}
	},

	removeDrawersEvent: function() {
		var furniture_removeDrawer = new THREE.Object3D();
		furniture_removeDrawer = this.furnitures[0].getFurniture();

		this.markCabinet(furniture_removeDrawer);		
		this.markDrawer(furniture_removeDrawer);
		var dresser = furniture_removeDrawer.getObjectByName("Dresser");
		this.hasBottom(dresser);
		this.hasBack(dresser);

		console.log("furniture_removeDrawer");
		console.log(furniture_removeDrawer);

		var count = new Array();
		if(!this.hasRemovedDrawers){			
			this.removeDrawersByColumn(furniture_removeDrawer, this.parameter, count);
			if(count.length < this.parameter){
				this.parameter = count.length;
				var tmp = [];
				this.removeDrawersByColumn(furniture_removeDrawer, this.parameter, tmp);
			}
			this.hasRemovedDrawers = true;
		}

		var spaceBox = this.getInsideSpace(furniture_removeDrawer);
		if(this.parameter < count.length){
			var offest = (spaceBox.max.y - spaceBox.min.y) / count.length;
			spaceBox.min.y += offest * (count.length - this.parameter);
		}

		var spaceSize = new THREE.Vector3();
		var spaceCenter = new THREE.Vector3();
		spaceBox.getSize(spaceSize);
		spaceBox.getCenter(spaceCenter);

		var offest = spaceSize.y / this.parameter;
		var tmp = spaceCenter.y + spaceSize.y/2;
		for (var i = 0; i < this.parameter; i++) {
			this.addShelf(furniture_removeDrawer, spaceCenter, spaceSize);
			spaceSize.y -= offest;
			spaceCenter.y = tmp - spaceSize.y/2;
		}
	},

	execute: function(tfname) {
		if(this.checkHasTopFront(this.furnitures[0])){
			if(tfname == "cut_chair"){
				this.cutToChairEvent();
			}
			if(tfname == "add_door"){
				this.addDoorEvent();
			}
			if(tfname == "add_leg"){
				this.addLegEvent();	
			}
			if(tfname == "add_rod"){
				this.addRodEvent();
			}
			if(tfname == "add_spice_rack"){
				this.addSpiceRackEvent();
			}
			if(tfname == "add_drawer"){
				this.addDrawerEvent();
			}
			if(tfname == "remove_drawers"){
				this.removeDrawersEvent();
			}
		}
		else{
			alert("Please mark cabinetTop and cabinetFront");
		}
		
	}
}

module.exports = Dresser_Add