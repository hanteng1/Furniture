"use strict;"

const CreateSupport = require('./CreateSupport')
const chairCreateBoard = require('./chairCreateBoard')
const CreateWheel = require('./CreateWheel')


function Desk (main){
	this.main = main;
	this.furnitures = main.furnitures;
}

Desk.prototype = {
	getPartSize: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);
		return box_size;
	},

	getPartCenter: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_center = new THREE.Vector3();
		box.getCenter (box_center);
		return box_center;
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

	objectAddToFurniture: function(furniture, object, position) {
		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture.matrixWorld);	
		object.applyMatrix(inverse);		
		furniture.worldToLocal(position);		
		object.position.set(position.x, position.y, position.z);		
		furniture.add(object);		
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

	test: function(pos) {
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var cube = new THREE.Mesh( geometry, material );
		cube.position.set(pos.x, pos.y, pos.z);
		this.main.scene.add( cube );
	},

	getDesktopSurfaceCenterPoint: function(Desk) {
		var desktop = Desk.getObjectByName("dTop");
		var desktopSize = this.getPartSize(desktop);
		var desktopCenter = this.getPartCenter(desktop);
		var origin = new THREE.Vector3(desktopCenter.x, desktopCenter.y + desktopSize.y, desktopCenter.z);
		var direction = new THREE.Vector3(0,-1,0);

		var intersects = this.getPointByRay(desktop, origin, direction);
		if(intersects.length > 0){
			return intersects[0].point;
		}
		else
			console.log("Desktop Surface Center Point miss");
	},

	addTopBoardEvent: function() {
		var desk = this.furnitures[0].getFurniture();
		var surfaceCenterPoint = this.getDesktopSurfaceCenterPoint(desk);
		var desktop = desk.getObjectByName("dTop");
		var desktopSize = this.getPartSize(desktop);
		// 0 ---- 1
		// |      |
		// |      |
		// 3 ---- 2
		var pos = [];

		pos.push(new THREE.Vector3(surfaceCenterPoint.x - desktopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z - desktopSize.z/4));
		pos.push(new THREE.Vector3(surfaceCenterPoint.x + desktopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z - desktopSize.z/4));
		pos.push(new THREE.Vector3(surfaceCenterPoint.x + desktopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z + desktopSize.z/4));
		pos.push(new THREE.Vector3(surfaceCenterPoint.x - desktopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z + desktopSize.z/4));

		var material = this.getPartMaterial(desktop);
		var geometry = CreateSupport(1);
		var support = new THREE.Mesh(geometry, material);
		support.name = "support";

		var supportSize = this.getPartSize(support);
		
		var supportArray = [];
		for (var i = 0; i < 4; i++) {
			supportArray[i] = new THREE.Object3D();
			supportArray[i] = support.clone();
			var tmp = new THREE.Vector3(pos[i].x, pos[i].y + supportSize.y/2, pos[i].z);
			this.objectAddToFurniture(desk, supportArray[i], tmp);
		}
		
		var offset = 2;
		geometry = chairCreateBoard(desktopSize.x + offset, 0.5, desktopSize.z + offset);
		var board = new THREE.Mesh(geometry, material);
		board.name = "board";
		var boardSize = this.getPartSize(board);
		var boardpos = new THREE.Vector3(surfaceCenterPoint.x - boardSize.x/2, 
			surfaceCenterPoint.y + supportSize.y + 0.12, surfaceCenterPoint.z - boardSize.z/2);
		// this.test(new THREE.Vector3(surfaceCenterPoint.x, surfaceCenterPoint.y + supportSize.y, surfaceCenterPoint.z));
		this.objectAddToFurniture(desk, board, boardpos);
	},

	addBottomBoardEvent: function() {
		var desk = this.furnitures[0].getFurniture();
		var desktop = desk.getObjectByName("dTop");
		var desktopSize = this.getPartSize(desktop);
		var deskSize = this.getPartSize(desk);
		var deskCenter = this.getPartCenter(desk);
		var material = this.getPartMaterial(desktop);
		var geometry = chairCreateBoard(desktopSize.x, 0.5, desktopSize.z);
		var board = new THREE.Mesh(geometry, material);
		board.name = "bottomBoard";
		var boardSize = this.getPartSize(board);
		var boardpos = new THREE.Vector3(deskCenter.x - boardSize.x/2 + 0.12, 
			deskCenter.y - deskSize.y/2 - boardSize.y/2 - 0.12, deskCenter.z - boardSize.z/2 + 0.12);
		this.objectAddToFurniture(desk, board, boardpos);
		desk.position.y += boardSize.y;
	},

	getInsideSpaceByBox: function(obj) {
		var objSize = this.getPartSize(obj);
		var objCenter = this.getPartCenter(obj);
		var allChildren = [];
		this.getAllChildren(obj, allChildren);
		var allChildrenBoxs = [];
		for (var i = 0; i < allChildren.length; i++) {
			var box = new THREE.Box3();
			box.setFromObject(allChildren[i]);
			allChildrenBoxs.push(box);
		}
		
		var checkbox = new THREE.Box3();
		var initSize = new THREE.Vector3(0.1, 0.1, 0.1);
		checkbox.setFromCenterAndSize(objCenter, initSize);

		var touch = false;
		while(checkbox.max.x < (objCenter.x + objSize.x/2) && !touch){
			for (var j = 0; j < allChildrenBoxs.length; j++) {
				if(!touch){
					if(checkbox.intersectsBox (allChildrenBoxs[j])){
						console.log("checkbox tuoch child (max.x)");
						console.log(allChildrenBoxs[j]);
						touch = true;
					}
				}
				else
					break;
			}
			checkbox.max.x += 0.1;
		}
		checkbox.max.x -= 0.2;

		touch = false;
		while(checkbox.min.x > (objCenter.x - objSize.x/2) && !touch){
			for (var j = 0; j < allChildrenBoxs.length; j++) {
				if(!touch){
					if(checkbox.intersectsBox (allChildrenBoxs[j])){
						console.log("checkbox tuoch child (min.x)");
						console.log(allChildrenBoxs[j]);
						touch = true;
					}
				}
				else
					break;
			}
			checkbox.min.x -= 0.1;
		}
		checkbox.min.x += 0.2;

		touch = false;
		while(checkbox.max.y < (objCenter.y + objSize.y/2) && !touch){
			for (var j = 0; j < allChildrenBoxs.length; j++) {
				if(!touch){
					if(checkbox.intersectsBox (allChildrenBoxs[j])){
						console.log("checkbox tuoch child (max.y)");
						console.log(allChildrenBoxs[j]);
						touch = true;
					}
				}
				else
					break;
			}
			checkbox.max.y += 0.1;
		}
		checkbox.max.y -= 0.2;

		touch = false;
		while(checkbox.min.y > (objCenter.y - objSize.y/2) && !touch){
			for (var j = 0; j < allChildrenBoxs.length; j++) {
				if(!touch){
					if(checkbox.intersectsBox (allChildrenBoxs[j])){
						console.log("checkbox tuoch child (min.y)");
						console.log(allChildrenBoxs[j]);
						touch = true;
					}
				}
				else
					break;
			}
			checkbox.min.y -= 0.1;
		}
		checkbox.min.y += 0.2;

		touch = false;
		while(checkbox.max.z < (objCenter.z + objSize.z/2) && !touch){
			for (var j = 0; j < allChildrenBoxs.length; j++) {
				if(!touch){
					if(checkbox.intersectsBox (allChildrenBoxs[j])){
						console.log("checkbox tuoch child (max.z)");
						console.log(allChildrenBoxs[j]);
						touch = true;
					}
				}
				else
					break;
			}
			checkbox.max.z += 0.1;
		}
		checkbox.max.z -= 0.2;

		touch = false;
		while(checkbox.min.z > (objCenter.z - objSize.z/2) && !touch){
			for (var j = 0; j < allChildrenBoxs.length; j++) {
				if(!touch){
					if(checkbox.intersectsBox (allChildrenBoxs[j])){
						console.log("checkbox tuoch child (min.z)");
						console.log(allChildrenBoxs[j]);
						touch = true;
					}
				}
				else
					break;
			}
			checkbox.min.z -= 0.1;
		}
		checkbox.min.z += 0.2;

		console.log("end check");
		console.log(checkbox);
		return checkbox;
	},

	getInsideSpaceByRay: function(obj) {
		var objCenter = this.getPartCenter(obj);

		var checkbox = new THREE.Box3();
		var initSize = new THREE.Vector3(0.1, 0.1, 0.1);
		checkbox.setFromCenterAndSize(objCenter, initSize);

		var origin = new THREE.Vector3(objCenter.x, objCenter.y, objCenter.z);
		var directionR = new THREE.Vector3(1,0,0);
		var directionL = new THREE.Vector3(-1,0,0);		
		var directionU = new THREE.Vector3(0,1,0);
		var directionD = new THREE.Vector3(0,-1,0);
		var directionF = new THREE.Vector3(0,0,1);
		var directionB = new THREE.Vector3(0,0,-1);

		var intersectsR = this.getPointByRay(obj, origin, directionR);
		var intersectsL = this.getPointByRay(obj, origin, directionL);
		var intersectsU = this.getPointByRay(obj, origin, directionU);
		var intersectsD = this.getPointByRay(obj, origin, directionD);
		var intersectsF = this.getPointByRay(obj, origin, directionF);
		var intersectsB = this.getPointByRay(obj, origin, directionD);

		if(intersectsR.length > 0)
			checkbox.max.x = intersectsR[0].point.x;
		else
			console.log("intersectsR miss");
		if(intersectsL.length > 0)
			checkbox.min.x = intersectsL[0].point.x;
		else
			console.log("intersectsL miss");
		if(intersectsU.length > 0)
			checkbox.max.y = intersectsU[0].point.x;
		else
			console.log("intersectsU miss");
		if(intersectsD.length > 0)
			checkbox.min.y = intersectsD[0].point.y;
		else
			console.log("intersectsD miss");
		if(intersectsF.length > 0)
			checkbox.max.z = intersectsF[0].point.y;
		else
			console.log("intersectsF miss");
		if(intersectsB.length > 0)
			checkbox.min.z = intersectsB[0].point.y;
		else
			console.log("intersectsB miss");

		return checkbox;
	},

	checkMaxValue: function(center, a, b, origin) {
		center = center.toFixed(4);
		a = a.toFixed(4);
		b = b.toFixed(4);
		origin = origin.toFixed(4);
		if(center == a && center == b)
			return origin;
		else if(center != a && center == b)
			return a;
		else if(center == a && center != b)
			return b;
		else{
			if(a < b)
				return b;
			else
				return a;
		}
	},

	checkMinValue: function(center, a, b, origin) {
		center = center.toFixed(4);
		a = a.toFixed(4);
		b = b.toFixed(4);
		origin = origin.toFixed(4);
		if(center == a && center == b)
			return origin;
		else if(center != a && center == b)
			return a;
		else if(center == a && center != b)
			return b;
		else{
			if(a < b)
				return a;
			else
				return b;
		}
	},

	addInsideBoardEvent: function() {
		var desk = this.furnitures[0].getFurniture();
		var deskCenter = this.getPartCenter(desk);
		var deskSize = this.getPartSize(desk);
		var box1 = this.getInsideSpaceByBox(desk);
		var box2 = this.getInsideSpaceByRay(desk);
		var box = new THREE.Box3();
		box.setFromObject(desk);
		
		var mergeBox = new THREE.Box3();
		mergeBox.max.x =  this.checkMaxValue(deskCenter.x, box1.max.x + 0.05, box2.max.x - 0.05, deskCenter.x + deskSize.x/2);
		mergeBox.max.y =  this.checkMaxValue(deskCenter.y, box1.max.y + 0.05, box2.max.y - 0.05, deskCenter.y + deskSize.y/2);
		mergeBox.max.z =  this.checkMaxValue(deskCenter.z, box1.max.z + 0.05, box2.max.z - 0.05, deskCenter.z + deskSize.z/2);

		mergeBox.min.x =  this.checkMinValue(deskCenter.x, box1.min.x - 0.05, box2.min.x + 0.05, deskCenter.x - deskSize.x/2);
		mergeBox.min.y =  this.checkMinValue(deskCenter.y, box1.min.y - 0.05, box2.min.y + 0.05, deskCenter.y - deskSize.y/2);
		mergeBox.min.z =  this.checkMinValue(deskCenter.z, box1.min.z - 0.05, box2.min.z + 0.05, deskCenter.z - deskSize.z/2);
		
		var mergeBoxCenter = new THREE.Vector3((parseFloat(mergeBox.max.x) + parseFloat(mergeBox.min.x)) / 2, 
											   (parseFloat(mergeBox.max.y) + parseFloat(mergeBox.min.y)) / 2, 
											   (parseFloat(mergeBox.max.z) + parseFloat(mergeBox.min.z)) / 2);
		var mergeBoxSize = new THREE.Vector3(parseFloat(mergeBox.max.x) - parseFloat(mergeBox.min.x), 
											 parseFloat(mergeBox.max.y) - parseFloat(mergeBox.min.y), 
											 parseFloat(mergeBox.max.z) - parseFloat(mergeBox.min.z));

		var material = this.getPartMaterial(desk);
		var geometry = chairCreateBoard(mergeBoxSize.x, 0.2, mergeBoxSize.z);
		var board = new THREE.Mesh(geometry, material);
		board.name = "insideBoard";
		var boardSize = this.getPartSize(board);
		var boardpos = new THREE.Vector3(mergeBoxCenter.x - boardSize.x/2 + 0.12, 
			mergeBoxCenter.y - boardSize.y/2 - 0.12, mergeBoxCenter.z - boardSize.z/2 + 0.12);
		this.objectAddToFurniture(desk, board, boardpos);
		
	},

	objectRotationByAxis: function(obj, axis, degree){
		var size = this.getPartSize(obj);
		var center = this.getPartCenter(obj);
		obj.position.set(0, 0, -30);
		if(axis == 'x'){			
			obj.rotateOnWorldAxis(new THREE.Vector3(1,0,0), degree);			
		}
		if(axis == 'y'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,1,0), degree);
		}
		if(axis == 'z'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,0,1), degree);
		}
		var newCenter = this.getPartCenter(obj);
		var offset = new THREE.Vector3(center.x - newCenter.x, center.y - newCenter.y, center.z - newCenter.z);
		obj.position.x += offset.x;
		obj.position.y += offset.y;
		obj.position.z += offset.z;		
	},

	loadModel: function( ModelPath , obj) {
		var scope = this;
		var model;
		// loading manager
		var loadingManager = new THREE.LoadingManager( function() {
			var board = obj.getObjectByName("insideBoard");
			var boardCenter = scope.getPartCenter(board);
			var boardSize = scope.getPartSize(board);
			var modelSize = scope.getPartSize(model);
			var pos = new THREE.Vector3(boardCenter.x + boardSize.x/2, boardCenter.y - boardSize.y/2, boardCenter.z + modelSize.z/2);
			scope.objectRotationByAxis(model, "z", Math.PI);			
			scope.objectAddToFurniture(obj, model, pos);
		} );
		
		// collada
		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( ModelPath , function ( collada ) {
			model = collada.scene;
			model.scale.set(1,1,1);			
			model.name = 'angle';
		} );
	},

	addBesideBoardEvent: function() {
		var desk = this.furnitures[0].getFurniture();
		var deskSize = this.getPartSize(desk);
		var deskCenter = this.getPartCenter(desk);
		var material = this.getPartMaterial(desk);
		var geometry = chairCreateBoard(deskSize.y, 0.2, deskSize.z);
		var board = new THREE.Mesh(geometry, material);
		board.name = "insideBoard";
		var boardSize = this.getPartSize(board);
		var boardpos = new THREE.Vector3(deskCenter.x - deskSize.x/2 - boardSize.x + 0.12, 
			deskCenter.y + deskSize.y/2 - boardSize.y/2 - 0.12, deskCenter.z - boardSize.z/2 + 0.12);
		this.objectAddToFurniture(desk, board, boardpos);

		this.loadModel('../models/angle.dae', desk);
	},

	addWheelEvent: function() {
		this.addBottomBoardEvent();
		var desk = this.furnitures[0].getFurniture();
		var bottomBoard = desk.getObjectByName("bottomBoard");
		var bottomBoardSize = this.getPartSize(bottomBoard);
		var bottomBoardCenter = this.getPartCenter(bottomBoard);
		var desktop = desk.getObjectByName("dTop");
		var material = this.getPartMaterial(desktop);
		var geometry = CreateWheel();
		var wheel = new THREE.Mesh(geometry, material);
		wheel.name = "wheel";
		var wheelSize = this.getPartSize(wheel);

		var wheelArray =[6];
		for (var i = 0, offset = 0; i < 3; i++, offset += bottomBoardSize.x/3) {
			wheelArray[i] = new THREE.Object3D();
			wheelArray[i] = wheel.clone();
			var pos = new THREE.Vector3(bottomBoardCenter.x - bottomBoardSize.x/3 + offset, 
				bottomBoardCenter.y - bottomBoardSize.y/2 - wheelSize.y/2, bottomBoardCenter.z - bottomBoardSize.z/4);
			this.objectAddToFurniture(desk, wheelArray[i], pos);
		}
		for (var i = 3, offset = 0; i < 6; i++, offset += bottomBoardSize.x/3) {
			wheelArray[i] = new THREE.Object3D();
			wheelArray[i] = wheel.clone();
			var pos = new THREE.Vector3(bottomBoardCenter.x - bottomBoardSize.x/3 + offset, 
				bottomBoardCenter.y - bottomBoardSize.y/2 - wheelSize.y/2, bottomBoardCenter.z + bottomBoardSize.z/4);
			this.objectAddToFurniture(desk, wheelArray[i], pos);
		}
		desk.position.y = desk.position.y + wheelSize.y;
	},



	execute: function(tfname) {
		if(this.furnitures.length > 0){
			var desktop = this.furnitures[0].getComponentByName("dTop");
			if(typeof desktop != 'undefined'){
				if(tfname == "addBesideBoard"){
					this.addBesideBoardEvent();
				}
				if(tfname == "addTopBoard"){
					this.addTopBoardEvent();
				}
				if(tfname == "addBottomBoard"){
					this.addBottomBoardEvent();
				}
				if(tfname == "addWheel"){
					this.addWheelEvent();
				}
				if(tfname == "addInsideBoard"){
					this.addInsideBoardEvent();
				}
			}
			else{
				console.log("Exist one desk isn't marked desktop.");
			}
		}
		else
			console.log("No Desk in the scene.");
	}

}

module.exports = Desk