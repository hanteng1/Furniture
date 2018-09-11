"use strict;"

const CreateWheel = require('./CreateWheel')
const CreateTableRod = require('./CreateTableRod')
const CreateRod = require('./CreateRod')
const CreateSpiceRack = require('./CreateSpiceRack')
const CreateDoor = require('./CreateDoor')
const CreateLeg = require('./CreateLeg')
const CreateHook = require('./CreateHook')
const chairCreateBoard = require('./chairCreateBoard')


function Model_Add(main){
	this.main = main;
    this.furnitures = main.furnitures;
    this.Add_mode = false;    

    //select box
    this.hasSelectBox = false;
    this.plane = ""; // "selectBoxFront" "selectBoxBack" "selectBoxLeft" "selectBoxRight" "selectBoxUp" "selectBoxDown" string

    //furniture
    this.selectFurnitureUUID = "";
    this.selectFurniture = new THREE.Object3D();
    
    
    //add object
    this.selectObjectName = "";
    this.selectObject = new THREE.Object3D();
    this.objectVectorList = {wheel: new THREE.Vector3(0,1,0), 
    						 rod: new THREE.Vector3(1,0,0), 
    						 verBoard: new THREE.Vector3(0,0,-1),
    						 horBoard: new THREE.Vector3(0,1,0),
    						 leg: new THREE.Vector3(0,-1,0),
    						 hook: new THREE.Vector3(0,0,-1),
    						 door: new THREE.Vector3(0,0,-1)
    						};
    this.objectAreaList = {wheel: [0.28, 0.28]};
    this.isCreateObject = false;

    this.textures = {};

    this.mousePoint = new THREE.Mesh();
}

Model_Add.prototype = {
	init: function() {
    	$('#parameter_control_tool_add').show();
        this.Add_mode = true;
        $('#parameter_control_tool_painting').hide();
        $('#parameter_control_tool_wrap').hide();
        $('#parameter_control_tool_align').hide();
        this.isCreateObject = false;

        var manager = new THREE.LoadingManager();
	    manager.onProgress = function ( item, loaded, total ) {
	        console.log( item, loaded, total );
	    };

	    var textureLoader = new THREE.TextureLoader( manager );
	    
	    this.textures["board"] = textureLoader.load( '../model/__Wood-cherry_.jpg' );
	    this.textures["board"].repeat.set(0.1, 0.1);
		this.textures["board"].wrapS = this.textures["board"].wrapT = THREE.MirroredRepeatWrapping;

		this.textures["board2"] = textureLoader.load( '../model/Cherry_Kaffe_Vert.jpg' );
	    this.textures["board2"].repeat.set(0.1, 0.1);
		this.textures["board2"].wrapS = this.textures["board"].wrapT = THREE.MirroredRepeatWrapping;

		this.textures["shiny"] = textureLoader.load( '../model/papel.jpg' );
	    this.textures["shiny"].repeat.set(0.1, 0.1);
		this.textures["shiny"].wrapS = this.textures["shiny"].wrapT = THREE.MirroredRepeatWrapping;

		this.textures["leg"] = textureLoader.load( '../model/Wood_Bamboo_Medium.jpg' );
	    this.textures["leg"].repeat.set(0.1, 0.1);
		this.textures["leg"].wrapS = this.textures["leg"].wrapT = THREE.MirroredRepeatWrapping;

		// var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		// var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
		// this.mousePoint = new THREE.Mesh( geometry, material );
		// this.mousePoint.name = "mousePoint";
		// this.mousePoint.position.set(1000, 0, 0);
		// this.main.scene.add(this.mousePoint);
	},

	test: function(pos) {
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} );
		var cube = new THREE.Mesh( geometry, material );
		cube.name = "cube";
		cube.position.set(pos.x, pos.y, pos.z);
		this.main.scene.add( cube );
	},

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

	objectAddToFurniture: function(furniture, object, position) {
		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture.matrixWorld);	
		object.applyMatrix(inverse);		
		furniture.worldToLocal(position);		
		object.position.set(position.x, position.y, position.z);		
		furniture.add(object);		
	},

	checkAxis: function(vector1, vector2) {
		if(vector1.x != 0){
			if(vector2.x != 0)
				return "y";
			if(vector2.y != 0)
				return "z";
			if(vector2.z != 0)
				return "y";
		}
		else if(vector1.y != 0){
			if(vector2.x != 0)
				return "z";
			if(vector2.y != 0)
				return "x";
			if(vector2.z != 0)
				return "x";
		}
		else{
			if(vector2.x != 0)
				return "y";
			if(vector2.y != 0)
				return "x";
			if(vector2.z != 0)
				return "y";
		}
	},

	checkDegree: function(vector1, vector2, axis) {
		var deg0 = vector1.clone();
		var deg90 = vector1.clone();
		var degn90 = vector1.clone();
		var deg180 = vector1.clone();

		if(axis == "x")
			var vector = new THREE.Vector3(1,0,0);
		if(axis == "y")
			var vector = new THREE.Vector3(0,1,0);
		if(axis == "z")
			var vector = new THREE.Vector3(0,0,1);

		deg90.applyAxisAngle(vector, Math.PI/2);
		degn90.applyAxisAngle(vector, -Math.PI/2);
		deg180.applyAxisAngle(vector, Math.PI);

		if(deg0.x.toFixed(4) == vector2.x && deg0.y.toFixed(4) == vector2.y && deg0.z.toFixed(4) == vector2.z)
			return 0;
		if(deg90.x.toFixed(4) == vector2.x && deg90.y.toFixed(4) == vector2.y && deg90.z.toFixed(4) == vector2.z)
			return Math.PI/2;
		if(degn90.x.toFixed(4) == vector2.x && degn90.y.toFixed(4) == vector2.y && degn90.z.toFixed(4) == vector2.z)
			return -Math.PI/2;
		if(deg180.x.toFixed(4) == vector2.x && deg180.y.toFixed(4) == vector2.y && deg180.z.toFixed(4) == vector2.z)
			return Math.PI;
	},

	objectRotationByAxis: function(obj, axis, degree) {
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
		obj.position.x = parseFloat(obj.position.x) + parseFloat(offset.x);
		obj.position.y = parseFloat(obj.position.y) + parseFloat(offset.y);
		obj.position.z = parseFloat(obj.position.z) + parseFloat(offset.z);
	},

	setAddObjectName: function(objectName) {
		this.selectObjectName = objectName;
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

	strcmp: function(str1, str2) {
		// http://kevin.vanzonneveld.net
	    // +   original by: Waldo Malqui Silva
	    // +      input by: Steve Hilder
	    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // +    revised by: gorthaur
	    // *     example 1: strcmp( 'waldo', 'owald' );
	    // *     returns 1: 1
	    // *     example 2: strcmp( 'owald', 'waldo' );
	    // *     returns 2: -1
    	return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
	},

	select: function(obj) {
		var furniture = new THREE.Object3D();
		if(this.strcmp(obj.uuid, this.selectFurnitureUUID) != 0){
			if(this.hasSelectBox){
				furniture = this.selectFurniture;				
				while(furniture.parent.uuid != this.main.scene.uuid)
					furniture = furniture.parent;

				this.deleteSelectBox(this.main.scene);
			}
			else
				this.hasSelectBox = true;

			this.selectFurnitureUUID = obj.uuid;
			this.selectFurniture = obj;

			this.createSelectBox(this.main.scene, obj);
		}
	},

	createSelectBox: function(furniture, obj) {
		// 0-----1   4-----5
		// | up  |   | down|
		// |     |   |     |
		// 3-----2   7-----6
		var corners = this.getAllCorners(obj);

        var xy_positive_geometry = new THREE.Geometry();
        var xy_negative_geometry = new THREE.Geometry();
        var yz_positive_geometry = new THREE.Geometry();
        var yz_negative_geometry = new THREE.Geometry();
        var xz_positive_geometry = new THREE.Geometry();
        var xz_negative_geometry = new THREE.Geometry();
        // XY positive (3, 7, 6, 2, 3)
        xy_positive_geometry.vertices.push(corners[3], corners[7], corners[6], corners[2]);
        // XY negative (1, 5, 4, 0, 1)
        xy_negative_geometry.vertices.push(corners[1], corners[5], corners[4], corners[0]);
        // YZ positive (2, 6, 5, 1, 2)
        yz_positive_geometry.vertices.push(corners[2], corners[6], corners[5], corners[1]);
        // YZ negative (0, 4, 7, 3, 0)
        yz_negative_geometry.vertices.push(corners[0], corners[4], corners[7], corners[3]);
        // XZ positive (0, 3, 2, 1, 0)
        xz_positive_geometry.vertices.push(corners[0], corners[3], corners[2], corners[1]);
        // XZ negative (5, 6, 7, 4, 5)
        xz_negative_geometry.vertices.push(corners[5], corners[6], corners[7], corners[4]);

		var selectedMaterial = new THREE.MeshLambertMaterial( {
			color: 0xffffff,
			opacity: 0.3,
			transparent: true
		} );
		var unselectedMaterial = new THREE.MeshLambertMaterial( {
			color: 0xffffff,
			opacity: 0.1,
			transparent: true
		} );

		xy_positive_geometry.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 3, 0 ) );
		xy_negative_geometry.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 3, 0 ) );
		yz_positive_geometry.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 3, 0 ) );
		yz_negative_geometry.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 3, 0 ) );
		xz_positive_geometry.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 3, 0 ) );
		xz_negative_geometry.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 3, 0 ) );

		var xy_positive = new THREE.Mesh( xy_positive_geometry, unselectedMaterial );
		var xy_negative = new THREE.Mesh( xy_negative_geometry, unselectedMaterial );
		var yz_positive = new THREE.Mesh( yz_positive_geometry, unselectedMaterial );
		var yz_negative = new THREE.Mesh( yz_negative_geometry, unselectedMaterial );
		var xz_positive = new THREE.Mesh( xz_positive_geometry, unselectedMaterial );
		var xz_negative = new THREE.Mesh( xz_negative_geometry, unselectedMaterial );

		xy_positive.name = "selectBoxFront";
		xy_negative.name = "selectBoxBack";
		yz_positive.name = "selectBoxRight";
		yz_negative.name = "selectBoxLeft";
		xz_positive.name = "selectBoxUp";
		xz_negative.name = "selectBoxDown";

		this.main.scene.add(xy_positive);
		this.main.scene.add(xy_negative);
		this.main.scene.add(yz_positive);
		this.main.scene.add(yz_negative);
		this.main.scene.add(xz_positive);
		this.main.scene.add(xz_negative);
	},

	deleteSelectBox: function(furniture) {
		console.log("deleteSelectBox");
		var xy_positive = furniture.getObjectByName("selectBoxFront");
		var xy_negative = furniture.getObjectByName("selectBoxBack");
		var yz_positive = furniture.getObjectByName("selectBoxRight");
		var yz_negative = furniture.getObjectByName("selectBoxLeft");
		var xz_positive = furniture.getObjectByName("selectBoxUp");
		var xz_negative = furniture.getObjectByName("selectBoxDown");
		furniture.remove(xy_positive, xy_negative, yz_positive, yz_negative, xz_positive, xz_negative);
	},

	changePlaneMaterial: function(plane, material) {
		var obj = this.main.scene.getObjectByName(plane);
		obj.material = material;
	},

	selectPlane: function(mouse, camera, point) {
		var selectedMaterial = new THREE.MeshLambertMaterial( {
			color: 0xffffff,
			opacity: 0.3,
			transparent: true
		} );
		var unselectedMaterial = new THREE.MeshLambertMaterial( {
			color: 0xffffff,
			opacity: 0.1,
			transparent: true
		} );
		var raycaster = new THREE.Raycaster();
		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
		raycaster.setFromCamera( mouse, camera );
		var frontIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("selectBoxFront"), true);
		var backIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("selectBoxBack"), true);
		var rightIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("selectBoxRight"), true);
		var leftIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("selectBoxLeft"), true);
		var upIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("selectBoxUp"), true);
		var downIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("selectBoxDown"), true);

		if(frontIntersects.length > 0){
			this.plane = "selectBoxFront";
			this.changePlaneMaterial("selectBoxFront", selectedMaterial);
		}
		else
			this.changePlaneMaterial("selectBoxFront", unselectedMaterial);
		
		if(backIntersects.length > 0){
			this.plane = "selectBoxBack";
			this.changePlaneMaterial("selectBoxBack", selectedMaterial);
		}
		else
			this.changePlaneMaterial("selectBoxBack", unselectedMaterial);
		
		if(rightIntersects.length > 0){
			this.plane = "selectBoxRight";
			this.changePlaneMaterial("selectBoxRight", selectedMaterial);
		}
		else
			this.changePlaneMaterial("selectBoxRight", unselectedMaterial);
		
		if(leftIntersects.length > 0){
			this.plane = "selectBoxLeft";
			this.changePlaneMaterial("selectBoxLeft", selectedMaterial);
		}
		else
			this.changePlaneMaterial("selectBoxLeft", unselectedMaterial);
		
		if(upIntersects.length > 0){
			this.plane = "selectBoxUp";
			this.changePlaneMaterial("selectBoxUp", selectedMaterial);
		}
		else
			this.changePlaneMaterial("selectBoxUp", unselectedMaterial);
		
		if(downIntersects.length > 0){
			this.plane = "selectBoxDown";
			this.changePlaneMaterial("selectBoxDown", selectedMaterial);
		}
		else
			this.changePlaneMaterial("selectBoxDown", unselectedMaterial);

		//remove object
		this.removeSelectObjectInScene();
		
		//create object
		this.createObject();
	},

	removeSelectObjectInScene: function() {
		if(this.selectObjectName != ""){
			var object = [];
			for (var i = 0; i < this.main.scene.children.length; i++) {
				if(this.main.scene.children[i].name == this.selectObjectName)
					object.push(this.main.scene.children[i]);
			}
			for (var i = 0; i < object.length; i++) {
				this.main.scene.remove(object[i]);				
			}
		}
		else
			console.log("No object is created");
	},

	createVerBoard: function(vector) {
		var furniture = this.selectFurniture;
		var texture = this.textures["board"];
		var boardSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var furnitureSize = this.getPartSize(furniture);
		// (width, height, depth)
		var array = [];
		array.push(furnitureSize.x);
		array.push(furnitureSize.y);
		array.push(furnitureSize.z);
		array.sort(function(a, b){return a-b});
		
		// if(this.plane == "selectBoxFront" || this.plane == "selectBoxBack"){
			var width = array[1];
			var height = 0.3;
			var depth = array[2];
		// }
		// if(this.plane == "selectBoxLeft" || this.plane == "selectBoxRight"){
		// 	var width = furnitureSize.z;
		// 	var height = 0.3;
		// 	var depth = furnitureSize.y;
		// }
		// if(this.plane == "selectBoxUp" || this.plane == "selectBoxDown"){
		// 	var width = furnitureSize.x;
		// 	var height = 0.3;
		// 	var depth = furnitureSize.z;
		// }
		
		var boardGeometry = chairCreateBoard(width, height, depth);

		var board = new THREE.Mesh(boardGeometry, boardSelectedMaterial);
		board.name = "vertical board";
		this.main.scene.add(board);
		board.position.set(0,0,0);

		var boardSize = this.getPartSize(board);
		var axis = this.checkAxis(this.objectVectorList.verBoard, vector);
		var degree = this.checkDegree(this.objectVectorList.verBoard, vector, axis);
		this.objectRotationByAxis(board, axis, degree);
		
		this.selectObject = board;
	},

	createHorBoard: function(vector) {//not yet
		var texture = this.textures["board2"];
		var boardSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var furnitureSize = this.getPartSize(this.selectFurniture);
		var array = [];
		array.push(furnitureSize.x);
		array.push(furnitureSize.y);
		array.push(furnitureSize.z);
		array.sort(function(a, b){return a-b});
		var width = array[1];
		var height = 0.3;
		var depth = array[2];
		// (width, height, depth)
		// if(this.plane == "selectBoxFront" || this.plane == "selectBoxBack"){
		// 	var width = furnitureSize.x;
		// 	var height = 0.3;
		// 	var depth = furnitureSize.x;
		// }
		// if(this.plane == "selectBoxLeft" || this.plane == "selectBoxRight"){
		// 	var width = furnitureSize.z;
		// 	var height = 0.3;
		// 	var depth = furnitureSize.z;
		// }
		// if(this.plane == "selectBoxUp" || this.plane == "selectBoxDown"){
		// 	var width = furnitureSize.x;
		// 	var height = 0.3;
		// 	var depth = furnitureSize.z;
		// }

		var boardGeometry = chairCreateBoard(width, height, depth);

		var board = new THREE.Mesh(boardGeometry, boardSelectedMaterial);
		board.name = "horizontal board";
		this.main.scene.add(board);
		board.position.set(0,0,0);

		var boardSize = this.getPartSize(board);
		var axis = this.checkAxis(this.objectVectorList.horBoard, vector);
		var degree = this.checkDegree(this.objectVectorList.horBoard, vector, axis);
		this.objectRotationByAxis(board, axis, degree);
		
		this.selectObject = board;
	},

	createRod: function(vector) {//rotation vector
		var texture = this.textures["shiny"];
		var rodSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var furnitureSize = this.getPartSize(this.selectFurniture);
		if(this.plane == "selectBoxFront" || this.plane == "selectBoxBack")
			var length = furnitureSize.x;
		if(this.plane == "selectBoxLeft" || this.plane == "selectBoxRight")
			var length = furnitureSize.z;
		if(this.plane == "selectBoxUp" || this.plane == "selectBoxDown")
			var length = furnitureSize.z;

		var rodGeometry = CreateTableRod(length);

		var rod = new THREE.Mesh(rodGeometry, rodSelectedMaterial);
		rod.name = "rod";
		this.main.scene.add(rod);
		rod.position.set(0,0,0);

		var rodSize = this.getPartSize(rod);
		var axis = this.checkAxis(this.objectVectorList.rod, vector);
		var degree = this.checkDegree(this.objectVectorList.rod, vector, axis);
		this.objectRotationByAxis(rod, axis, degree);
		
		this.selectObject = rod;
		
	},

	createLeg: function(vector){
		var texture = this.textures["leg"];
		var legSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var legGeometry = CreateLeg(3);

		var leg = new THREE.Mesh(legGeometry, legSelectedMaterial);
		leg.name = "leg";
		this.main.scene.add(leg);
		leg.position.set(0,0,0);

		var legSize = this.getPartSize(leg);
		var axis = this.checkAxis(this.objectVectorList.leg, vector);
		var degree = this.checkDegree(this.objectVectorList.leg, vector, axis);
		this.objectRotationByAxis(leg, axis, degree);
		
		this.selectObject = leg;
	},

	createWheel: function(vector) {//rotation vector
		var wheelSelectedMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
		var wheelGeometry = CreateWheel();

		var wheel = new THREE.Mesh(wheelGeometry, wheelSelectedMaterial);
		wheel.name = "wheel";
		this.main.scene.add(wheel);
		wheel.position.set(0,0,0);

		var wheelSize = this.getPartSize(wheel);
		var axis = this.checkAxis(this.objectVectorList.wheel, vector);
		var degree = this.checkDegree(this.objectVectorList.wheel, vector, axis);
		this.objectRotationByAxis(wheel, axis, degree);
		
		this.selectObject = wheel;
	},

	createHook: function(vector) {//rotation vector
		var texture = this.textures["shiny"];
		var hookSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var hookGeometry = CreateHook();

		var hook = new THREE.Mesh(hookGeometry, hookSelectedMaterial);
		hook.name = "hook";
		this.main.scene.add(hook);
		hook.position.set(0,0,0);

		var hookSize = this.getPartSize(hook);
		var axis = this.checkAxis(this.objectVectorList.hook, vector);
		var degree = this.checkDegree(this.objectVectorList.hook, vector, axis);
		this.objectRotationByAxis(hook, axis, degree);
		
		this.selectObject = hook;
	},

	createDoor: function(vector) {
		var texture = this.textures["shiny"];
		var doorSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );

		var furnitureSize = this.getPartSize(this.selectFurniture);
		if(this.plane == "selectBoxFront" || this.plane == "selectBoxBack") {
			var h = furnitureSize.y;
			var w = furnitureSize.z;
		}
		if(this.plane == "selectBoxLeft" || this.plane == "selectBoxRight") {
			var h = furnitureSize.y;
			var w = furnitureSize.z;
		}
		if(this.plane == "selectBoxUp" || this.plane == "selectBoxDown") {
			var h = furnitureSize.x;
			var w = furnitureSize.z;
		}

		var doorGeometry = CreateDoor(h+1, w+1);
		var door = new THREE.Mesh(doorGeometry, doorSelectedMaterial);
		door.name = "door";
		this.main.scene.add(door);
		door.position.set(0,0,0);

		var doorSize = this.getPartSize(door);
		var axis = this.checkAxis(this.objectVectorList.door, vector);
		var degree = this.checkDegree(this.objectVectorList.door, vector, axis);
		this.objectRotationByAxis(door, axis, degree);

		this.selectObject = door;
	},

	createObject: function() {
		this.isCreateObject = true;
		console.log("create a new " + this.selectObjectName);
		//which plan selected
		if(this.plane == "selectBoxFront")
			var vector = new THREE.Vector3(0,0,-1);
		if (this.plane == "selectBoxBack")
			var vector = new THREE.Vector3(0,0,1);
		if(this.plane == "selectBoxLeft")
			var vector = new THREE.Vector3(1,0,0);
		if(this.plane == "selectBoxRight")
			var vector = new THREE.Vector3(-1,0,0);
		if(this.plane == "selectBoxUp")
			var vector = new THREE.Vector3(0,-1,0);
		if(this.plane == "selectBoxDown")
			var vector = new THREE.Vector3(0,1,0);
		
		//what object need create
		if(this.selectObjectName == "vertical board")
			this.createVerBoard(vector);
		if(this.selectObjectName == "horizontal board")
			this.createHorBoard(vector);
		if(this.selectObjectName == "rod")
			this.createRod(vector);
		if(this.selectObjectName == "leg")
			this.createLeg(vector);
		if(this.selectObjectName == "wheel")
			this.createWheel(vector);
		if(this.selectObjectName == "hook")
			this.createHook(vector);
		if(this.selectObjectName == "door")
			this.createDoor(vector);
	},

	checkOnThePlane: function(pos) {
		var furnitureCenter = this.getPartCenter(this.selectFurniture);
		furnitureCenter.x = furnitureCenter.x.toFixed(4);
		furnitureCenter.y = furnitureCenter.y.toFixed(4);
		furnitureCenter.z = furnitureCenter.z.toFixed(4);
		var furnitureSize = this.getPartSize(this.selectFurniture);
		furnitureSize.x = furnitureSize.x.toFixed(4);
		furnitureSize.y = furnitureSize.y.toFixed(4);
		furnitureSize.z = furnitureSize.z.toFixed(4);
		pos.x = pos.x.toFixed(4);
		pos.y = pos.y.toFixed(4);
		pos.z = pos.z.toFixed(4);

		if(this.plane == "selectBoxFront"){ // z+
			var tmp = parseFloat(furnitureCenter.z) + parseFloat(furnitureSize.z)/2;
			tmp = tmp.toFixed(4);
			if(pos.z >= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "selectBoxBack"){ //z-
			var tmp = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z)/2;
			tmp = tmp.toFixed(4);
			if(pos.z <= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "selectBoxLeft"){ //x-
			var tmp = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x)/2;
			tmp = tmp.toFixed(4);
			if(pos.x <= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "selectBoxRight"){ //x+
			var tmp = parseFloat(furnitureCenter.x) + parseFloat(furnitureSize.x)/2;
			tmp = tmp.toFixed(4);
			if(pos.x >= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "selectBoxUp"){ //y+
			var tmp = parseFloat(furnitureCenter.y) + parseFloat(furnitureSize.y)/2;
			tmp = tmp.toFixed(4);
			if(pos.y >= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "selectBoxDown"){ //y-
			var tmp = parseFloat(furnitureCenter.y) - parseFloat(furnitureSize.y)/2;
			tmp = tmp.toFixed(4);
			if(pos.y <= tmp)
				return true;
			else
				return false;
		}
	},

	updateVerBoardPosition: function(pos) {
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	updateHorBoardPosition: function(pos) {
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	getRodOffset: function() {
		var rodSize = this.getPartSize(this.selectObject);
		if(this.plane == "selectBoxFront")
			return new THREE.Vector3(rodSize.x/2, 0, rodSize.z/2);
		if(this.plane == "selectBoxBack")
			return new THREE.Vector3(-rodSize.x/2, 0, -rodSize.z/2);
		if(this.plane == "selectBoxLeft")
			return new THREE.Vector3(-rodSize.x/2, 0, rodSize.z/2);
		if(this.plane == "selectBoxRight")
			return new THREE.Vector3(rodSize.x/2, 0, -rodSize.z/2);
		if(this.plane == "selectBoxUp")
			return new THREE.Vector3(0, rodSize.y/2, -rodSize.z/2);
		if(this.plane == "selectBoxDown")
			return new THREE.Vector3(0, -rodSize.y/2, -rodSize.z/2);
	},

	updateRodPosition: function(pos) {
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			var offset = this.getRodOffset();
			pos.x = parseFloat(pos.x) + parseFloat(offset.x);
			pos.y = parseFloat(pos.y) + parseFloat(offset.y);
			pos.z = parseFloat(pos.z) + parseFloat(offset.z);
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	updateLegPosition: function(pos) {
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	updateWheelPosition: function(pos) {
		var furnitureCenter = this.getPartCenter(this.selectFurniture);
		var furnitureSize = this.getPartSize(this.selectFurniture);
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	getHookOffset: function() {
		var hookSize = this.getPartSize(this.selectObject);
		if(this.plane == "selectBoxFront")
			return new THREE.Vector3(hookSize.x/2, 0, hookSize.z/2);
		if(this.plane == "selectBoxBack")
			return new THREE.Vector3(-hookSize.x/2, 0, -hookSize.z/2);
		if(this.plane == "selectBoxLeft")
			return new THREE.Vector3(-hookSize.x/2, 0, hookSize.z/2);
		if(this.plane == "selectBoxRight")
			return new THREE.Vector3(hookSize.x/2, 0, -hookSize.z/2);
		if(this.plane == "selectBoxUp")
			return new THREE.Vector3(0, hookSize.y/2, -hookSize.z/2);
		if(this.plane == "selectBoxDown")
			return new THREE.Vector3(0, -hookSize.y/2, -hookSize.z/2);
	},

	updateHookPosition: function(pos) {
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			var offset = this.getRodOffset();
			pos.x = parseFloat(pos.x) + parseFloat(offset.x);
			pos.y = parseFloat(pos.y) + parseFloat(offset.y);
			pos.z = parseFloat(pos.z) + parseFloat(offset.z);
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	getDoorOffset: function() {
		var dookSize = this.getPartSize(this.selectObject);
		if(this.plane == "selectBoxFront")
			return new THREE.Vector3(dookSize.x/2, 0, dookSize.z/2 - 0.2);
		if(this.plane == "selectBoxBack")
			return new THREE.Vector3(-dookSize.x/2, 0, -dookSize.z/2 + 0.2);
		if(this.plane == "selectBoxLeft")
			return new THREE.Vector3(-dookSize.x/2 + 0.2, 0, dookSize.z/2);
		if(this.plane == "selectBoxRight")
			return new THREE.Vector3(dookSize.x/2 -0.2, 0, -dookSize.z/2);
		if(this.plane == "selectBoxUp")
			return new THREE.Vector3(0, dookSize.y/2 - 0.2, -dookSize.z/2);
		if(this.plane == "selectBoxDown")
			return new THREE.Vector3(0, -dookSize.y/2 + 0.2, -dookSize.z/2);
	},

	updateDoorPosition: function(pos) {
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			var offset = this.getDoorOffset();
			pos.x = parseFloat(pos.x) + parseFloat(offset.x);
			pos.y = parseFloat(pos.y) + parseFloat(offset.y);
			pos.z = parseFloat(pos.z) + parseFloat(offset.z);
			this.selectObject.position.set(pos.x, pos.y, pos.z);
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	updateObjectPosition: function(pos) {
		// control list
		console.log("update " + this.selectObjectName + " position");
		if(this.selectObjectName == "vertical board"){
			this.updateVerBoardPosition(pos);
		}
		if(this.selectObjectName == "horizontal board"){
			this.updateHorBoardPosition(pos);
		}
		if(this.selectObjectName == "rod"){
			this.updateRodPosition(pos);
		}
		if(this.selectObjectName == "leg"){
			this.updateLegPosition(pos);
		}
		if(this.selectObjectName == "wheel"){
			this.updateWheelPosition(pos);
		}
		if(this.selectObjectName == "hook"){
			this.updateHookPosition(pos);
		}
		if(this.selectObjectName == "door"){
			this.updateDoorPosition(pos);
		}
		// ...

		
	},

	execute: function( name ){
		this.init();
		var scope = this;
		$( ".item.ui.image.label.add.vertical.board" ).click( function() {
			scope.removeSelectObjectInScene();
			scope.setAddObjectName("vertical board");
			console.log("click vertical board");
        });
        $( ".item.ui.image.label.add.horizontal.board" ).click( function() {
        	scope.removeSelectObjectInScene();
			scope.setAddObjectName("horizontal board");
			console.log("click horizontal board");
        });
        $( ".item.ui.image.label.add.rod" ).click( function() {
        	scope.removeSelectObjectInScene();
        	scope.setAddObjectName("rod");
        	console.log("click rod");
        });
        $( ".item.ui.image.label.add.leg" ).click( function() {
        	scope.removeSelectObjectInScene();
        	scope.setAddObjectName("leg");
        	console.log("click leg");
        });
        $( ".item.ui.image.label.add.wheel" ).click( function() {
        	scope.removeSelectObjectInScene();
        	scope.setAddObjectName("wheel");
        	console.log("click wheel");
        });
        $( ".item.ui.image.label.add.hook" ).click( function() {
        	scope.removeSelectObjectInScene();
        	scope.setAddObjectName("hook");
        	console.log("click hook");
        });
        $( ".item.ui.image.label.add.door" ).click( function() {
        	scope.removeSelectObjectInScene();		
			scope.setAddObjectName("door");
			console.log("click door");
        }); 
	}
}

module.exports = Model_Add