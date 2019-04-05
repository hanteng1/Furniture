"use strict;"

const CreateWheel = require('./CreateWheel')
const CreateTableRod = require('./CreateTableRod')
const CreateRod = require('./CreateRod')
const CreateSpiceRack = require('./CreateSpiceRack')
const CreateDoor = require('./CreateDoor')
const CreateLeg = require('./CreateLeg')
const CreateHook = require('./CreateHook')
const chairCreateBoard = require('./chairCreateBoard')
const Procedure_button = require('./Procedure_button');

function Model_Add(main){
	this.main = main;
    this.furnitures = main.furnitures;
    this.Add_mode = false;    

    //select box
    this.hasSelectBox = false;
    this.planeNormalVector = new THREE.Vector3();

    //furniture
    this.selectFurnitureUUID = "";
    this.selectFurniture = new THREE.Object3D();
    
    
    //add object
    this.selectObjectName = "";
    this.selectObject = new THREE.Object3D();
    this.objectVectorList = {wheel: new THREE.Vector3(0,-1,0), 
    						 rod: new THREE.Vector3(-1,0,0), 
    						 verBoard: new THREE.Vector3(0,0,1),
    						 horBoard: new THREE.Vector3(0,-1,0),
    						 leg: new THREE.Vector3(0,1,0),
    						 hook: new THREE.Vector3(0,0,1),
    						 door: new THREE.Vector3(0,0,1)
    						};
    this.objectAreaList = {wheel: [0.28, 0.28]};
    this.objectVector = new THREE.Vector3();
    this.isCreateObject = false;

    this.isCreateInsideObject = false;

    this.textures = {};
    var scope = this;
	$( ".item.ui.image.label.add.vertical.board" ).click( function() {
		scope.DeleteButton();
		scope.removeSelectObjectInScene();
		scope.setAddObjectName("create vertical board");
		console.log("click vertical board");
		scope.isCreateObject = false;
    });
    $( ".item.ui.image.label.add.horizontal.board" ).click( function() {
    	scope.DeleteButton();
		scope.removeSelectObjectInScene();
		scope.setAddObjectName("create horizontal board");
		console.log("click horizontal board");
		scope.isCreateObject = false;
    });
    $( ".item.ui.image.label.add.rod" ).click( function() {
    	scope.DeleteButton();
		scope.removeSelectObjectInScene();
    	scope.setAddObjectName("create rod");
    	console.log("click rod");
    	scope.isCreateObject = false;
    });
    $( ".item.ui.image.label.add.leg" ).click( function() {
    	scope.DeleteButton();
		scope.removeSelectObjectInScene();
    	scope.setAddObjectName("create leg");
    	console.log("click leg");
    	scope.isCreateObject = false;
    });
    $( ".item.ui.image.label.add.wheel" ).click( function() {
    	scope.DeleteButton();
		scope.removeSelectObjectInScene();
    	scope.setAddObjectName("create wheel");
    	console.log("click wheel");
    	scope.isCreateObject = false;
    });
    $( ".item.ui.image.label.add.hook" ).click( function() {
    	scope.DeleteButton();
		scope.removeSelectObjectInScene();
    	scope.setAddObjectName("create hook");
    	console.log("click hook");
    	scope.isCreateObject = false;
    });
    $( ".item.ui.image.label.add.door" ).click( function() {
    	scope.DeleteButton();
		scope.removeSelectObjectInScene();		
		scope.setAddObjectName("create door");
		console.log("click door");
		scope.isCreateObject = false;
    }); 
}

Model_Add.prototype = {
	init: function() {

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
	},

	test: function(pos) {
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} );
		var cube = new THREE.Mesh( geometry, material );
		cube.name = "cube";
		cube.position.set(pos.x, pos.y, pos.z);
		this.main.scene.add( cube );
	},

	getSelectFurnitureSizeWithoutCreateObject: function() {
		var furniture = this.selectFurniture;
		while(furniture.parent != this.main.scene)
			furniture = furniture.parent;
		var boxes = [];
		for (var i = 0; i < furniture.children.length; i++) {
			if(furniture.children[i].type == "Mesh"){
				var name = furniture.children[i].name;
				var isCreatePart = name.includes("create");
				if(!isCreatePart){
					var box = new THREE.Box3();
					box.setFromObject(furniture.children[i]);
					boxes.push(box);
				}
			}
		}
		var tmp = new THREE.Box3();
		for (var i = 0; i < boxes.length; i++) {
			tmp = tmp.union(boxes[i]);
		}
		var result = new THREE.Vector3();
		tmp.getSize(result);
		return result;
	},

	getSelectFurnitureCenterWithoutCreateObject: function() {
		var furniture = this.selectFurniture;
		while(furniture.parent != this.main.scene)
			furniture = furniture.parent;
		var boxes = [];
		for (var i = 0; i < furniture.children.length; i++) {
			if(furniture.children[i].type == "Mesh"){
				var name = furniture.children[i].name;
				var isCreatePart = name.includes("create");
				if(!isCreatePart){
					var box = new THREE.Box3();
					box.setFromObject(furniture.children[i]);
					boxes.push(box);
				}
			}
		}
		var tmp = new THREE.Box3();
		for (var i = 0; i < boxes.length; i++) {
			tmp = tmp.union(boxes[i]);
		}
		var result = new THREE.Vector3();
		tmp.getCenter(result);
		return result;
	},

	checkInsidePosint(furniture, pos){
		var boxes = [];
		for (var i = 0; i < furniture.children.length; i++) {
			if(furniture.children[i].type == "Mesh"){
				var name = furniture.children[i].name;
				var isCreatePart = name.includes("create");
				if(!isCreatePart){
					var box = new THREE.Box3();
					box.setFromObject(furniture.children[i]);
					boxes.push(box);
				}
			}
		}
		var tmp = new THREE.Box3();
		for (var i = 0; i < boxes.length; i++) {
			tmp = tmp.union(boxes[i]);
		}

		tmp.max.x = parseFloat(tmp.max.x) - 0.001;
		tmp.max.y = parseFloat(tmp.max.y) - 0.001;
		tmp.max.z = parseFloat(tmp.max.z) - 0.001;
		tmp.min.x = parseFloat(tmp.min.x) + 0.001;
		tmp.min.y = parseFloat(tmp.min.y) + 0.001;
		tmp.min.z = parseFloat(tmp.min.z) + 0.001;

		if(tmp.containsPoint(pos))
			return true;
		else
			return false;
	},

	getFurnitureNormalVectorToWorldVector: function(furniture, normalVector) {
		normalVector.x = normalVector.x.toFixed(0);
		normalVector.y = normalVector.y.toFixed(0);
		normalVector.z = normalVector.z.toFixed(0);
		var zreo = new THREE.Vector3(0,0,0);
		normalVector = furniture.localToWorld(normalVector);
		zreo = furniture.localToWorld(zreo);
		var result = new THREE.Vector3(normalVector.x - zreo.x, 
			normalVector.y - zreo.y, normalVector.z - zreo.z);
		result.x = parseFloat(result.x.toFixed(2));
		result.y = parseFloat(result.y.toFixed(2));
		result.z = parseFloat(result.z.toFixed(2));
		if(parseFloat(result.x) != 0)
			result.x = Math.abs(parseFloat(result.x)) / parseFloat(result.x);
		if(parseFloat(result.y) != 0)
			result.y = Math.abs(parseFloat(result.y)) / parseFloat(result.y);
		if(parseFloat(result.z) != 0)
			result.z = Math.abs(parseFloat(result.z)) / parseFloat(result.z);
		return result;
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

	createVerBoard: function() {
		var furniture = this.selectFurniture;
		var texture = this.textures["board"];
		var boardSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var furnitureSize = this.getSelectFurnitureSizeWithoutCreateObject();
		// (width, height, depth)
		var array = [];
		array.push(furnitureSize.x);
		array.push(furnitureSize.y);
		array.push(furnitureSize.z);
		array.sort(function(a, b){return a-b});		
		
		var width = array[1];
		var height = 0.3;
		var depth = array[2];
		
		var boardGeometry = chairCreateBoard(width, height, depth);

		var board = new THREE.Mesh(boardGeometry, boardSelectedMaterial);
		board.name = "create vertical board";
		this.main.scene.add(board);
		board.position.set(0,0,0);

		this.objectVector = this.objectVectorList.verBoard;
		this.selectObject = board;
	},

	createHorBoard: function() {//not yet
		var texture = this.textures["board2"];
		var boardSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var furnitureSize = this.getSelectFurnitureSizeWithoutCreateObject();
		var array = [];
		array.push(furnitureSize.x);
		array.push(furnitureSize.y);
		array.push(furnitureSize.z);
		array.sort(function(a, b){return a-b});
		var width = array[1];
		var height = 0.3;
		var depth = array[2];

		var boardGeometry = chairCreateBoard(width, height, depth);

		var board = new THREE.Mesh(boardGeometry, boardSelectedMaterial);
		board.name = "create horizontal board";
		this.main.scene.add(board);
		board.position.set(0,0,0);

		this.objectVector = this.objectVectorList.horBoard;
		this.selectObject = board;
	},

	createRod: function() {//rotation vector
		// var texture = this.textures["shiny"];
		// var rodSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var rodSelectedMaterial = new THREE.MeshPhongMaterial({
														color:0x202020,
														emissive: 0x0,
														specular: 0xffffff,
														shininess: 20
														});
		var length = 8;
		var rodGeometry = CreateTableRod(length);

		var rod = new THREE.Mesh(rodGeometry, rodSelectedMaterial);
		rod.name = "create rod";
		this.main.scene.add(rod);
		rod.position.set(0,0,0);

		this.objectVector = this.objectVectorList.rod;
		this.selectObject = rod;
	},

	createLeg: function(){
		var texture = this.textures["leg"];
		var legSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var legGeometry = CreateLeg(3);

		var leg = new THREE.Mesh(legGeometry, legSelectedMaterial);
		leg.name = "create leg";
		this.main.scene.add(leg);
		leg.position.set(0,0,0);
		
		this.objectVector = this.objectVectorList.leg;
		this.selectObject = leg;
	},

	createWheel: function() {//rotation vector
		var wheelSelectedMaterial = new THREE.MeshBasicMaterial( {color: 0x000000} );
		var wheelGeometry = CreateWheel();

		var wheel = new THREE.Mesh(wheelGeometry, wheelSelectedMaterial);
		wheel.name = "create wheel";
		this.main.scene.add(wheel);
		wheel.position.set(0,0,0);
		
		this.objectVector = this.objectVectorList.wheel;
		this.selectObject = wheel;
	},

	createHook: function() {//rotation vector
		var texture = this.textures["shiny"];
		var hookSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var hookGeometry = CreateHook();

		var hook = new THREE.Mesh(hookGeometry, hookSelectedMaterial);
		hook.name = "create hook";
		this.main.scene.add(hook);
		hook.position.set(0,0,0);
		hook.scale.set(0.1, 0.1, 0.1);
		
		this.objectVector = this.objectVectorList.hook;
		this.selectObject = hook;
	},

	createDoor: function() {
		// var texture = this.textures["shiny"];
		// var doorSelectedMaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var doorSelectedMaterial = new THREE.MeshPhongMaterial({
														color:0x202020,
														emissive: 0x0,
														specular: 0xffffff,
														shininess: 20
														});

		var h = 7.5;
		var w = 8.5;

		var doorGeometry = CreateDoor(h, w);
		var door = new THREE.Mesh(doorGeometry, doorSelectedMaterial);
		door.name = "create door";
		this.main.scene.add(door);
		door.position.set(0,0,0);

		this.objectVector = this.objectVectorList.door;

		this.selectObject = door;
	},

	createObject: function() {
		this.isCreateObject = true;	
		
		//what object need create
		if(this.selectObjectName == "create vertical board")
			this.createVerBoard();
		if(this.selectObjectName == "create horizontal board")
			this.createHorBoard();
		if(this.selectObjectName == "create rod")
			this.createRod();
		if(this.selectObjectName == "create leg")
			this.createLeg();
		if(this.selectObjectName == "create wheel")
			this.createWheel();
		if(this.selectObjectName == "create hook")
			this.createHook();
		if(this.selectObjectName == "create door")
			this.createDoor();
	},

	rotateObjectVectorToPlaneNormalVector: function() {
		var pos_x = new THREE.Vector3(1,0,0);
		var pos_y = new THREE.Vector3(0,1,0);
		var pos_z = new THREE.Vector3(0,0,1);
		var neg_x = new THREE.Vector3(-1,0,0);
		var neg_y = new THREE.Vector3(0,-1,0);
		var neg_z = new THREE.Vector3(0,0,-1);
		if(this.objectVector.equals(pos_x)){
			if(this.planeNormalVector.equals(pos_y)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
			}
			if(this.planeNormalVector.equals(pos_z)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_x)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
			}
			if(this.planeNormalVector.equals(neg_y)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_z)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
			}
		}
		else if(this.objectVector.equals(pos_y)){
			if(this.planeNormalVector.equals(pos_x)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(pos_z)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_x)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
			}
			if(this.planeNormalVector.equals(neg_y)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI);
			}
			if(this.planeNormalVector.equals(neg_z)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
			}
		}
		else if(this.objectVector.equals(pos_z)){
			if(this.planeNormalVector.equals(pos_x)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
			}
			if(this.planeNormalVector.equals(pos_y)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
			}
			if(this.planeNormalVector.equals(neg_x)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_y)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_z)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
			}
		}
		else if(this.objectVector.equals(neg_x)){
			if(this.planeNormalVector.equals(pos_x)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
			}
			if(this.planeNormalVector.equals(pos_y)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
			}
			if(this.planeNormalVector.equals(pos_z)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
			}
			if(this.planeNormalVector.equals(neg_y)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_z)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
			}
		}
		else if(this.objectVector.equals(neg_y)){
			if(this.planeNormalVector.equals(pos_x)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
			}
			if(this.planeNormalVector.equals(pos_y)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI);
			}
			if(this.planeNormalVector.equals(pos_z)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(neg_x)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
			}
			if(this.planeNormalVector.equals(neg_z)){
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
			}
		}
		else if(this.objectVector.equals(neg_z)){
			if(this.planeNormalVector.equals(pos_x)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
			}
			if(this.planeNormalVector.equals(pos_y)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2);
			}
			if(this.planeNormalVector.equals(pos_z)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI);
			}
			if(this.planeNormalVector.equals(neg_x)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2);
			}
			if(this.planeNormalVector.equals(neg_y)){
				this.objectRotationByAxis(this.selectObject, "y", Math.PI/2+Math.PI);
				this.objectRotationByAxis(this.selectObject, "z", Math.PI/2+Math.PI);
			}
		}
		else 
			return;
		this.objectVector = this.planeNormalVector;
	},

	resizeVerBoard: function(obj) {
		if(!this.objectVector.equals(this.planeNormalVector)){
			var objSize = this.getPartSize(obj);
			var objScale = obj.scale.clone();
			var furnitureSize = this.getSelectFurnitureSizeWithoutCreateObject();
			var pos_x = new THREE.Vector3(1,0,0);
			var pos_y = new THREE.Vector3(0,1,0);
			var pos_z = new THREE.Vector3(0,0,1);
			var neg_x = new THREE.Vector3(-1,0,0);
			var neg_y = new THREE.Vector3(0,-1,0);
			var neg_z = new THREE.Vector3(0,0,-1);
			if(this.planeNormalVector.equals(pos_x) || this.planeNormalVector.equals(neg_x)){
				console.log("Resize to NormalVector X");
				objScale.x = objScale.x / objSize.x * furnitureSize.x;
				objScale.y = objScale.y / objSize.y * 0.3;
				objScale.z = objScale.z / objSize.z * furnitureSize.z;
			}
			if(this.planeNormalVector.equals(pos_y) || this.planeNormalVector.equals(neg_y)){
				console.log("Resize to NormalVector Y");
				objScale.x = objScale.x / objSize.x * furnitureSize.x;
				objScale.y = objScale.y / objSize.y * (furnitureSize.y / 3);
				objScale.z = objScale.z / objSize.z * 0.3;
			}
			if(this.planeNormalVector.equals(pos_z) || this.planeNormalVector.equals(neg_z)){
				console.log("Resize to NormalVector Z");
				objScale.x = objScale.x / objSize.x * furnitureSize.x;
				objScale.y = objScale.y / objSize.y * 0.3;
				objScale.z = objScale.z / objSize.z * furnitureSize.z;
			}
			obj.scale.x = objScale.x;
			obj.scale.y = objScale.y;
			obj.scale.z = objScale.z;
		}
		this.objectVector = this.planeNormalVector;
	},

	getVerBoardOffset: function(pos) {
		var verBoardSize = this.getPartSize(this.selectObject);
		var zero = new THREE.Vector3(-verBoardSize.x/2, verBoardSize.y/2, -verBoardSize.z/2);
		var furnitureSize = this.getSelectFurnitureSizeWithoutCreateObject();
		var furnitureCenter = this.getSelectFurnitureCenterWithoutCreateObject();
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,1))){
			var x = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x) / 2;
			var y = parseFloat(pos.y);
			var z = parseFloat(pos.z);
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,-1))){
			var x = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x) / 2;
			var y = parseFloat(pos.y);
			var z = parseFloat(pos.z) - parseFloat(verBoardSize.z) + 0.12 * this.selectObject.scale.z;
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(-1,0,0))){
			var x = parseFloat(pos.x) - parseFloat(verBoardSize.x) + 0.12 * this.selectObject.scale.x;
			var y = parseFloat(pos.y);
			var z = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z) / 2;
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(1,0,0))){
			var x = parseFloat(pos.x) + 0.12 * this.selectObject.scale.x;
			var y = parseFloat(pos.y);
			var z = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z) / 2;
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(0,1,0))){
			var x = parseFloat(pos.x) + parseFloat(zero.x);
			var y = parseFloat(pos.y) + 0.12 * this.selectObject.scale.y;
			var z = parseFloat(pos.z) + parseFloat(zero.z);
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(0,-1,0))){
			var x = parseFloat(pos.x) + parseFloat(zero.x);
			var y = parseFloat(pos.y) - parseFloat(zero.y) - 0.12 * this.selectObject.scale.y;
			var z = parseFloat(pos.z) + parseFloat(zero.z);
			return new THREE.Vector3(x, y, z);
		}
	},

	updateVerBoardPosition: function(pos) {
		this.resizeVerBoard(this.selectObject);
		var offset = this.getVerBoardOffset(pos);
		this.selectObject.position.set(offset.x, offset.y, offset.z);
	},

	resizeHorBoard: function(obj) {
		if(!this.objectVector.equals(this.planeNormalVector)){
			var objSize = this.getPartSize(obj);
			var objScale = obj.scale.clone();
			var furnitureSize = this.getSelectFurnitureSizeWithoutCreateObject();
			var pos_x = new THREE.Vector3(1,0,0);
			var pos_y = new THREE.Vector3(0,1,0);
			var pos_z = new THREE.Vector3(0,0,1);
			var neg_x = new THREE.Vector3(-1,0,0);
			var neg_y = new THREE.Vector3(0,-1,0);
			var neg_z = new THREE.Vector3(0,0,-1);
			if(this.planeNormalVector.equals(pos_x) || this.planeNormalVector.equals(neg_x)){
				console.log("Resize to NormalVector X");
				objScale.x = objScale.x / objSize.x * 0.3;
				objScale.y = objScale.y / objSize.y * furnitureSize.y;
				objScale.z = objScale.z / objSize.z * furnitureSize.z;
			}
			if(this.planeNormalVector.equals(pos_y) || this.planeNormalVector.equals(neg_y)){
				console.log("Resize to NormalVector Y");
				objScale.x = objScale.x / objSize.x * furnitureSize.x;
				objScale.y = objScale.y / objSize.y * 0.3;
				objScale.z = objScale.z / objSize.z * furnitureSize.z;
			}
			if(this.planeNormalVector.equals(pos_z) || this.planeNormalVector.equals(neg_z)){
				console.log("Resize to NormalVector Z");
				objScale.x = objScale.x / objSize.x * furnitureSize.x;
				objScale.y = objScale.y / objSize.y * furnitureSize.y;
				objScale.z = objScale.z / objSize.z * 0.3;
			}
			obj.scale.x = objScale.x;
			obj.scale.y = objScale.y;
			obj.scale.z = objScale.z;
		}
		this.objectVector = this.planeNormalVector;
	},

	getHorBoardOffset: function(pos) {
		var horBoardSize = this.getPartSize(this.selectObject);
		var zero = new THREE.Vector3(-horBoardSize.x/2, horBoardSize.y/2, -horBoardSize.z/2);
		var furnitureSize = this.getSelectFurnitureSizeWithoutCreateObject();
		var furnitureCenter = this.getSelectFurnitureCenterWithoutCreateObject();
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,1))){
			var x = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x) / 2 + 0.12 * this.selectObject.scale.x;
			var y = parseFloat(pos.y) + 0.12 * this.selectObject.scale.y;
			var z = parseFloat(pos.z);
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,-1))){
			var x = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x) / 2 + 0.12 * this.selectObject.scale.x;
			var y = parseFloat(pos.y) + 0.12 * this.selectObject.scale.y;
			var z = parseFloat(pos.z) - parseFloat(horBoardSize.z);
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(-1,0,0))){
			var x = parseFloat(pos.x) - parseFloat(horBoardSize.x);
			var y = parseFloat(pos.y) + 0.12 * this.selectObject.scale.y;
			var z = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z) / 2 + 0.12 * this.selectObject.scale.z;
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(1,0,0))){
			var x = parseFloat(pos.x);
			var y = parseFloat(pos.y) + 0.12 * this.selectObject.scale.y;
			var z = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z) / 2 + 0.12 * this.selectObject.scale.z;
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(0,1,0))){
			var x = parseFloat(pos.x) + parseFloat(zero.x);
			var y = parseFloat(pos.y) + 0.12 * this.selectObject.scale.y;
			var z = parseFloat(pos.z) + parseFloat(zero.z);
			return new THREE.Vector3(x, y, z);
		}
		if(this.planeNormalVector.equals(new THREE.Vector3(0,-1,0))){
			var x = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x) / 2;
			var y = parseFloat(pos.y) - parseFloat(zero.y) - 0.12 * this.selectObject.scale.y;
			var z = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z) / 2;
			return new THREE.Vector3(x, y, z);
		}
	},

	updateHorBoardPosition: function(pos) {
		this.resizeHorBoard(this.selectObject);
		var offset = this.getHorBoardOffset(pos);
		this.selectObject.position.set(offset.x, offset.y, offset.z);
	},

	getRodOffset: function() {
		var rodSize = this.getPartSize(this.selectObject);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,1)))
			return new THREE.Vector3(rodSize.x/2, 0, rodSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,-1)))
			return new THREE.Vector3(-rodSize.x/2, 0, -rodSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(-1,0,0)))
			return new THREE.Vector3(-rodSize.x/2, 0, rodSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(1,0,0)))
			return new THREE.Vector3(rodSize.x/2, 0, -rodSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,1,0)))
			return new THREE.Vector3(0, rodSize.y/2, -rodSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,-1,0)))
			return new THREE.Vector3(0, -rodSize.y/2, -rodSize.z/2);
	},

	updateRodPosition: function(pos) {
		this.rotateObjectVectorToPlaneNormalVector();
		var offset = this.getRodOffset();
		pos.x = parseFloat(pos.x) + parseFloat(offset.x);
		pos.y = parseFloat(pos.y) + parseFloat(offset.y);
		pos.z = parseFloat(pos.z) + parseFloat(offset.z);
		this.selectObject.position.set(pos.x, pos.y, pos.z);
	},

	updateLegPosition: function(pos) {
		this.rotateObjectVectorToPlaneNormalVector();
		this.selectObject.position.set(pos.x, pos.y, pos.z);
	},

	getWheelOffset: function() {
		var wheelSize = this.getPartSize(this.selectObject);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,1)))
			return new THREE.Vector3(0, 0, wheelSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,-1)))
			return new THREE.Vector3(0, 0, -wheelSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(-1,0,0)))
			return new THREE.Vector3(-wheelSize.x/2, 0, 0);
		if(this.planeNormalVector.equals(new THREE.Vector3(1,0,0)))
			return new THREE.Vector3(wheelSize.x/2, 0, 0);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,1,0)))
			return new THREE.Vector3(0, wheelSize.y/2, 0);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,-1,0)))
			return new THREE.Vector3(0, -wheelSize.y/2, 0);
	},

	updateWheelPosition: function(pos) {
		this.rotateObjectVectorToPlaneNormalVector();
		var offset = this.getWheelOffset();
		pos.x = parseFloat(pos.x) + parseFloat(offset.x);
		pos.y = parseFloat(pos.y) + parseFloat(offset.y);
		pos.z = parseFloat(pos.z) + parseFloat(offset.z);
		this.selectObject.position.set(pos.x, pos.y, pos.z);
	},

	getHookOffset: function() {
		var hookSize = this.getPartSize(this.selectObject);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,1)))
			return new THREE.Vector3(hookSize.x/2, 0, hookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,-1)))
			return new THREE.Vector3(-hookSize.x/2, 0, -hookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(-1,0,0)))
			return new THREE.Vector3(-hookSize.x/2, 0, hookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(1,0,0)))
			return new THREE.Vector3(hookSize.x/2, 0, -hookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,1,0)))
			return new THREE.Vector3(0, hookSize.y/2, -hookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,-1,0)))
			return new THREE.Vector3(0, -hookSize.y/2, -hookSize.z/2);
	},

	updateHookPosition: function(pos) {
		this.rotateObjectVectorToPlaneNormalVector();
		var offset = this.getHookOffset();
		pos.x = parseFloat(pos.x) + parseFloat(offset.x);
		pos.y = parseFloat(pos.y) + parseFloat(offset.y);
		pos.z = parseFloat(pos.z) + parseFloat(offset.z);
		this.selectObject.position.set(pos.x, pos.y, pos.z);		
	},

	getDoorOffset: function() {
		var dookSize = this.getPartSize(this.selectObject);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,1)))
			return new THREE.Vector3(dookSize.x/2, 0, dookSize.z/2 - 0.2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,0,-1)))
			return new THREE.Vector3(-dookSize.x/2, 0, -dookSize.z/2 + 0.2);
		if(this.planeNormalVector.equals(new THREE.Vector3(-1,0,0)))
			return new THREE.Vector3(-dookSize.x/2 + 0.2, 0, dookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(1,0,0)))
			return new THREE.Vector3(dookSize.x/2 -0.2, 0, -dookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,1,0)))
			return new THREE.Vector3(0, dookSize.y/2 - 0.2, -dookSize.z/2);
		if(this.planeNormalVector.equals(new THREE.Vector3(0,-1,0)))
			return new THREE.Vector3(0, -dookSize.y/2 + 0.2, -dookSize.z/2);
	},

	updateDoorPosition: function(pos) {
		this.rotateObjectVectorToPlaneNormalVector();
		var offset = this.getDoorOffset();
		pos.x = parseFloat(pos.x) + parseFloat(offset.x);
		pos.y = parseFloat(pos.y) + parseFloat(offset.y);
		pos.z = parseFloat(pos.z) + parseFloat(offset.z);
		this.selectObject.position.set(pos.x, pos.y, pos.z);
	},

	updateObjectPosition: function(pos, furnitureNormalVector) {
		// control list
		this.planeNormalVector = furnitureNormalVector;
		// console.log("update " + this.selectObjectName + " position");
		if(this.selectObjectName == "create vertical board"){
			this.updateVerBoardPosition(pos);
		}
		if(this.selectObjectName == "create horizontal board"){
			this.updateHorBoardPosition(pos);
		}
		if(this.selectObjectName == "create rod"){
			this.updateRodPosition(pos);
		}
		if(this.selectObjectName == "create leg"){
			this.updateLegPosition(pos);
		}
		if(this.selectObjectName == "create wheel"){
			this.updateWheelPosition(pos);
		}
		if(this.selectObjectName == "create hook"){
			this.updateHookPosition(pos);
		}
		if(this.selectObjectName == "create door"){
			this.updateDoorPosition(pos);
		}
		// ...
	},

	execute: function( name ){
		this.init();
		if(this.Add_mode == false && name=='add'){
        	$('#parameter_control_tool_add').show();
            this.Add_mode = true;
            this.main.processor.executeDesign("MODEL_PAINTING", "add");
        	this.main.processor.executeDesign("MODEL_WRAP", "add");
        	this.main.processor.executeDesign("MODEL_ROTATION", "add");
        	this.main.processor.executeDesign("MODEL_ADDBETWEEN", "add");
        	this.main.processor.executeDesign("MODEL_CUT", "add");
        	this.main.processor.executeDesign("MODEL_ALIGN", "add");

        	//creat procedure button
        	if(this.main.stepOperationName != name){
        		this.DeleteButton();
	        	Procedure_button( this.main, this.main.stepOperationName );
	        	//record the operation name
	        	this.main.stepOperationName = name;
        	}
	        	
        }
        else if(this.Add_mode == true || name!= 'add'){
        	$('#parameter_control_tool_add').hide();
            this.Add_mode = false;
        }
	},

	insideCase: function(furniture, pos, localNormalVector) { 
		//furniture: a part of whole furniture //this.selectFurniture: whole furniture
		//pos: window ray inside point // localNormalVector: a part of whole furniture local normal vector
		var normalVector = this.getFurnitureNormalVectorToWorldVector(furniture, localNormalVector);
		var negNormalVector = new THREE.Vector3(-parseFloat(normalVector.x), -parseFloat(normalVector.y), -parseFloat(normalVector.z));

		var newPos = new THREE.Vector3(parseFloat(pos.x) + parseFloat(normalVector.x) * 0.01,
									   parseFloat(pos.y) + parseFloat(normalVector.y) * 0.01,
									   parseFloat(pos.z) + parseFloat(normalVector.z) * 0.01 );
		
		
		var vector = this.checkGrowthVector(this.selectFurniture, newPos, normalVector);

		if(vector == "fail")
			console.log("GrowthVector is not correct");
		else if(vector == "axis y fail")
			console.log("GrowthVector y is not correct");
		else {
			// if(!this.isCreateInsideObject){
			// 	this.removeSelectObjectInScene();
			// }
			var dir = "";
			if(vector.equals(new THREE.Vector3(1,0,0)) || vector.equals(new THREE.Vector3(-1,0,0)))
				dir = "x";
			else if(vector.equals(new THREE.Vector3(0,1,0)) || vector.equals(new THREE.Vector3(0,-1,0)))
				dir = "y";
			else if(vector.equals(new THREE.Vector3(0,0,1)) || vector.equals(new THREE.Vector3(0,0,-1)))
				dir = "z";

			// //get start point and end point
			var twoPoint = this.getRange(this.selectFurniture, newPos, vector);

			//create points on the line
			var points = [];
			if(dir == "x"){
				if(parseFloat(twoPoint[0].x) < parseFloat(twoPoint[1].x)){
					for (var i = parseFloat(twoPoint[0].x); i < parseFloat(twoPoint[1].x); i += 0.01) {
						var tmp = new THREE.Vector3(i, parseFloat(twoPoint[0].y), parseFloat(twoPoint[0].z));
						points.push(tmp);
					}
				}
				else{
					for (var i = parseFloat(twoPoint[1].x); i < parseFloat(twoPoint[0].x); i += 0.01) {
						var tmp = new THREE.Vector3(i, parseFloat(twoPoint[0].y), parseFloat(twoPoint[0].z));
						points.push(tmp);
					}
				}
			}
			if(dir == "y"){
				if(parseFloat(twoPoint[0].y) < parseFloat(twoPoint[1].y)){
					for (var i = parseFloat(twoPoint[0].y); i < parseFloat(twoPoint[1].y); i+= 0.01) {
						var tmp = new THREE.Vector3(parseFloat(twoPoint[0].x), i, parseFloat(twoPoint[0].z));
						points.push(tmp);
					}
				}
				else{
					for (var i = parseFloat(twoPoint[1].y); i < parseFloat(twoPoint[0].y); i+= 0.01) {
						var tmp = new THREE.Vector3(parseFloat(twoPoint[0].x), i, parseFloat(twoPoint[0].z));
						points.push(tmp);
					}
				}
			}
			if(dir == "z"){
				if(parseFloat(twoPoint[0].z) < parseFloat(twoPoint[1].z)){
					for (var i = parseFloat(twoPoint[0].z); i < parseFloat(twoPoint[1].z); i+= 0.01) {
						var tmp = new THREE.Vector3(parseFloat(twoPoint[0].x), parseFloat(twoPoint[0].y), i);
						points.push(tmp);
					}
				}
				else {
					for (var i = parseFloat(twoPoint[1].z); i < parseFloat(twoPoint[0].z); i+= 0.01) {
						var tmp = new THREE.Vector3(parseFloat(twoPoint[0].x), parseFloat(twoPoint[0].y), i);
						points.push(tmp);
					}
				}
			}

			// //init points info
			var marked = [];
			for (var i = 0; i < points.length; i++) {
				marked.push("M"); // all points init "miss"
			}

			//check range first time
			for (var i = 0; i < points.length; i++) {
				var intersects = this.getPointByRay(this.selectFurniture, points[i], negNormalVector);
				if(intersects.length > 0){
					marked[i] = "H"; // the point is on the same side with user selected point
				}
			}

			// //check range second time
			for (var i = 0; i < marked.length; i++) {
				if (marked[i] == "H"){
					var intersects = this.getPointByRay(this.selectFurniture, points[i], normalVector);
					if(intersects.length == 0){
						marked[i] = "M"; // the opposite point not find 
					}
				}
			}

			// get min and max
		    // H--------H points
		    // |        |
		    // i        j
		    // |        |
		    // H--------H oppositePoints
			var i = 0;
			while(marked[i] != "H" && i < marked.length)
				i++;
			var j = marked.length - 1;
			while(marked[j] != "H" && j >= 0)
				j--;
			
			var intersects1 = this.getPointByRay(this.selectFurniture, points[i], negNormalVector);
			var intersects2 = this.getPointByRay(this.selectFurniture, points[i], normalVector);
			var intersects3 = this.getPointByRay(this.selectFurniture, points[j], negNormalVector);
			var intersects4 = this.getPointByRay(this.selectFurniture, points[j], normalVector);

			var point1 = intersects1[0].point;
			var point2 = intersects2[0].point;
			var point3 = intersects3[0].point;
			var point4 = intersects4[0].point;

			// console.log("sub");
			var tmp1 = point1.clone();
			tmp1.sub(point2);
			// console.log(tmp1);
			var tmp2 = point2.clone();
			tmp2.sub(point4);
			// console.log(tmp2);
			var width, height, depth;
			if(parseFloat(tmp1.x).toFixed(3) != 0){
				width = Math.abs(parseFloat(tmp1.x).toFixed(3));
			}
			if(parseFloat(tmp1.y).toFixed(3) != 0){
				height = Math.abs(parseFloat(tmp1.y).toFixed(3));
			}
			if(parseFloat(tmp1.z).toFixed(3) != 0){
				depth = Math.abs(parseFloat(tmp1.z).toFixed(3));
			}

			if(parseFloat(tmp2.x).toFixed(3) != 0){
				width = Math.abs(parseFloat(tmp2.x).toFixed(3));
			}
			if(parseFloat(tmp2.y).toFixed(3) != 0){
				height = Math.abs(parseFloat(tmp2.y).toFixed(3));
			}
			if(parseFloat(tmp2.z).toFixed(3) != 0){
				depth = Math.abs(parseFloat(tmp2.z).toFixed(3));
			}

			if(typeof(width) == "undefined" || width == 0)
				width = 0.3;
			if(typeof(height) == "undefined" || height === 0)
				height = 0.3;
			if(typeof(depth) == "undefined" || depth == 0)
				depth = 0.3;

			if(this.selectObjectName == "") {
				var texture = this.textures["leg"];
				var material = new THREE.MeshBasicMaterial( {map: texture} );
				var geometry = chairCreateBoard(width, height, depth);
				var insideBoard = new THREE.Mesh(geometry, material);
				insideBoard.name = "create vertical board";
				this.selectObject = insideBoard;
				this.selectObjectName = insideBoard.name;
				insideBoard.position.set(0,0,-30);
				this.main.scene.add(insideBoard);
			}
			else {
				var objSize = this.getPartSize(this.selectObject);
				var objScale = this.selectObject.scale.clone();
				objScale.x = objScale.x / objSize.x * width;
				objScale.y = objScale.y / objSize.y * height;
				objScale.z = objScale.z / objSize.z * depth;
			}


			var tmpx = (parseFloat(point1.x) + parseFloat(point2.x) + parseFloat(point3.x) + parseFloat(point4.x))/4;
			var tmpy = (parseFloat(point1.y) + parseFloat(point2.y) + parseFloat(point3.y) + parseFloat(point4.y))/4;
			var tmpz = (parseFloat(point1.z) + parseFloat(point2.z) + parseFloat(point3.z) + parseFloat(point4.z))/4;
			var updatePosition = new THREE.Vector3(tmpx, tmpy, tmpz);
			
			for (var i = 0; i < this.main.scene.children.length; i++) {
				if(this.main.scene.children[i].name == "create vertical board"){
					var insideObj = this.main.scene.children[i];
					break;
				}
			}
			var insideObjSize = this.getPartSize(insideObj);
			insideObj.position.set( tmpx - parseFloat(insideObjSize.x)/2, 
									tmpy - parseFloat(insideObjSize.y)/2, 
									tmpz - parseFloat(insideObjSize.z)/2);
		}
	},

	checkGrowthVector: function(furniture, newPos, normalVector) {
		//furniture: whole furniture 
		if(normalVector.equals(new THREE.Vector3(1,0,0)) || normalVector.equals(new THREE.Vector3(-1,0,0))) {
			return new THREE.Vector3(0,0,1);
		}
		else if(normalVector.equals(new THREE.Vector3(0,1,0)) || normalVector.equals(new THREE.Vector3(0,-1,0))) {
			var growthVector_positive_x = new THREE.Vector3(1,0,0);
			var growthVector_negative_x = new THREE.Vector3(-1,0,0);
			var growthVector_positive_z = new THREE.Vector3(0,0,1);
			var growthVector_negative_z = new THREE.Vector3(0,0,-1);
			var intersects_positive_x = this.getPointByRay(furniture, newPos, growthVector_positive_x);
			var intersects_negative_x = this.getPointByRay(furniture, newPos, growthVector_negative_x);
			var intersects_positive_z = this.getPointByRay(furniture, newPos, growthVector_positive_z);
			var intersects_negative_z = this.getPointByRay(furniture, newPos, growthVector_negative_z);

			if (intersects_positive_x.length > 0 && intersects_negative_x.length > 0) {
				return new THREE.Vector3(0,0,1);
			}
			else if (intersects_positive_z.length > 0 && intersects_negative_z.length > 0) {
				return new THREE.Vector3(1,0,0);
			}
			else
				return "axis y fail";
		}
		else if(normalVector.equals(new THREE.Vector3(0,0,1)) || normalVector.equals(new THREE.Vector3(0,0,-1))) {
			return new THREE.Vector3(1,0,0);
		}
		else
			return "fail";
	},

	getRange: function(furniture, pos, vector) {
		// furniture: whole furniture // pos: user select point // vector: detecte
		var pn = parseFloat(vector.x) + parseFloat(vector.y) + parseFloat(vector.z);
		var dir = "";
		if(vector.equals(new THREE.Vector3(1,0,0)) || vector.equals(new THREE.Vector3(-1,0,0)))
			dir = "x";
		else if(vector.equals(new THREE.Vector3(0,1,0)) || vector.equals(new THREE.Vector3(0,-1,0)))
			dir = "y";
		else if(vector.equals(new THREE.Vector3(0,0,1)) || vector.equals(new THREE.Vector3(0,0,-1)))
			dir = "z";
		// console.log("dir = " + dir);
		var furnitureSize = this.getPartSize(furniture);
		var furnitureCenter = this.getPartCenter(furniture);
		var point1 = pos.clone();
		var point2 = pos.clone();
		var intersects1 = this.getPointByRay(furniture, pos, vector);
		if (intersects1.length > 0) {
			point1 = intersects1[0].point;
		}
		else {
			if(dir == "x")
				point1.x = furnitureCenter.x + furnitureSize.x/2;
			if(dir == "y")
				point1.y = furnitureCenter.y + furnitureSize.y/2;
			if(dir == "z")
				point1.z = furnitureCenter.z + furnitureSize.z/2;
		}
		// console.log(point1);
		var negVector = vector.clone();
		negVector.negate ();
		var intersects2 = this.getPointByRay(furniture, pos, negVector);
		if (intersects2.length > 0) {
			point2 = intersects2[0].point;
		}
		else {
			if(dir == "x")
				point2.x = furnitureCenter.x - furnitureSize.x/2;
			if(dir == "y")
				point2.y = furnitureCenter.y - furnitureSize.y/2;
			if(dir == "z")
				point2.z = furnitureCenter.z - furnitureSize.z/2;
		}
		// console.log(point2);
		if(pn > 0){
			if(dir == "x"){
				point1.x = parseFloat(point1.x) - 0.01;
				point2.x = parseFloat(point2.x) + 0.01;
			}
			if(dir == "y"){
				point1.y = parseFloat(point1.y) - 0.01;
				point2.y = parseFloat(point2.y) + 0.01;
			}
			if(dir == "z"){
				point1.z = parseFloat(point1.z) - 0.01;
				point2.z = parseFloat(point2.z) + 0.01;
			}
		}
		else{
			if(dir == "x"){
				var point1 = parseFloat(point1.x) + 0.01;
				var point2 = parseFloat(point2.x) - 0.01;
			}
			if(dir == "y"){
				var point1 = parseFloat(point1.y) + 0.01;
				var point2 = parseFloat(point2.y) - 0.01;
			}
			if(dir == "z"){
				var point1 = parseFloat(point1.z) + 0.01;
				var point2 = parseFloat(point2.z) - 0.01;
			}
		}
		var twoPoint = [];
		twoPoint.push(point1);
		twoPoint.push(point2);
		return twoPoint;
	},
	DeleteButton: function(){
    	//console.log(this.main.stepNumber);
		//console.log(this.main.stepObject.length);
		this.main.lastStep = true;
		if (this.main.stepNumber < this.main.stepObject.length){
			var stepLength = this.main.stepObject.length;

			for(var i=parseInt(this.main.stepNumber); i<stepLength; i++){
				var btn = document.getElementById(
					"ui circular icon button procedure "+i.toString());
				btn.parentNode.removeChild(btn);
			}
			this.main.stepObject.length = parseInt(this.main.stepNumber);
		}

    }
}

module.exports = Model_Add