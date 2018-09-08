"use strict;"

const CreateWheel = require('./CreateWheel')
const CreateTableRod = require('./CreateTableRod')
const CreateRod = require('./CreateRod')
const CreateSpiceRack = require('./CreateSpiceRack')
const CreateDoor = require('./CreateDoor')
const CreateDresserLeg = require('./CreateDresserLeg')
const CreateDrawer = require('./CreateDrawer')




function Model_Add(main){
	this.main = main;
    this.furnitures = main.furnitures;
    this.Add_mode = false;    

    //select box
    this.hasSelectBox = false;
    this.plane = ""; // "front" "back" "left" "right" "up" "down" string

    //furniture
    this.selectFurnitureUUID = "";
    this.selectFurniture = new THREE.Object3D();
    
    
    //add object
    this.selectObjectName = "";
    this.selectObject = new THREE.Object3D();
    this.objectVectorList = {wheel: new THREE.Vector3(0,1,0)};
    this.objectAreaList = {wheel: [0.28, 0.28]};
    this.isCreateObject = false;
}

Model_Add.prototype = {
	init: function() {
		
    	$('#parameter_control_tool_add').show();
        this.Add_mode = true;
       
        $('#parameter_control_tool_painting').hide();
        $('#parameter_control_tool_wrap').hide();
        $('#parameter_control_tool_align').hide();
        this.isCreateObject = false;
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
				return "x";
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
		obj.position.x += offset.x;
		obj.position.y += offset.y;
		obj.position.z += offset.z;		
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

		xy_positive.name = "front";
		xy_negative.name = "back";
		yz_positive.name = "right";
		yz_negative.name = "left";
		xz_positive.name = "up";
		xz_negative.name = "down";

		this.main.scene.add(xy_positive);
		this.main.scene.add(xy_negative);
		this.main.scene.add(yz_positive);
		this.main.scene.add(yz_negative);
		this.main.scene.add(xz_positive);
		this.main.scene.add(xz_negative);
	},

	deleteSelectBox: function(furniture) {
		console.log("deleteSelectBox");
		var xy_positive = furniture.getObjectByName("front");
		var xy_negative = furniture.getObjectByName("back");
		var yz_positive = furniture.getObjectByName("right");
		var yz_negative = furniture.getObjectByName("left");
		var xz_positive = furniture.getObjectByName("up");
		var xz_negative = furniture.getObjectByName("down");
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
		var frontIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("front"), true);
		var backIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("back"), true);
		var rightIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("right"), true);
		var leftIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("left"), true);
		var upIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("up"), true);
		var downIntersects = raycaster.intersectObject( this.main.scene.getObjectByName("down"), true);

		if(frontIntersects.length > 0){
			this.plane = "front";
			this.changePlaneMaterial("front", selectedMaterial);
		}
		else
			this.changePlaneMaterial("front", unselectedMaterial);
		
		if(backIntersects.length > 0){
			this.plane = "back";
			this.changePlaneMaterial("back", selectedMaterial);
		}
		else
			this.changePlaneMaterial("back", unselectedMaterial);
		
		if(rightIntersects.length > 0){
			this.plane = "right";
			this.changePlaneMaterial("right", selectedMaterial);
		}
		else
			this.changePlaneMaterial("right", unselectedMaterial);
		
		if(leftIntersects.length > 0){
			this.plane = "left";
			this.changePlaneMaterial("left", selectedMaterial);
		}
		else
			this.changePlaneMaterial("left", unselectedMaterial);
		
		if(upIntersects.length > 0){
			this.plane = "up";
			this.changePlaneMaterial("up", selectedMaterial);
		}
		else
			this.changePlaneMaterial("up", unselectedMaterial);
		
		if(downIntersects.length > 0){
			this.plane = "down";
			this.changePlaneMaterial("down", selectedMaterial);
		}
		else
			this.changePlaneMaterial("down", unselectedMaterial);

		//remove object
		var object = [];
		for (var i = 0; i < this.main.scene.children.length; i++) {
			if(this.main.scene.children[i].name == this.selectObjectName)
				object.push(this.main.scene.children[i]);
		}
		for (var i = 0; i < object.length; i++) {
			this.main.scene.remove(object[i]);				
		}
		
		//create object
		this.createObject();
	},

	createWheel: function(vector) {//rotation vector
		var wheelSelectedMaterial = new THREE.MeshLambertMaterial( {
			color: 0x000000,
			opacity: 0.5,
			transparent: true
		} );
		var wheelGeometry = CreateWheel();
		var wheel = new THREE.Mesh(wheelGeometry, wheelSelectedMaterial);
		wheel.name = "wheel";
		var wheelSize = this.getPartSize(wheel);
		var axis = this.checkAxis(this.objectVectorList.wheel, vector);
		var degree = this.checkDegree(this.objectVectorList.wheel, vector, axis);
		this.objectRotationByAxis(wheel, axis, degree);
		this.main.scene.add(wheel);
		this.selectObject = wheel;
	},

	createObject: function() {
		this.isCreateObject = true;

		//which plan selected
		if(this.plane == "front")
			var vector = new THREE.Vector3(0,0,-1);
		if (this.plane == "back")
			var vector = new THREE.Vector3(0,0,1);
		if(this.plane == "left")
			var vector = new THREE.Vector3(1,0,0);
		if(this.plane == "right")
			var vector = new THREE.Vector3(-1,0,0);
		if(this.plane == "up")
			var vector = new THREE.Vector3(0,-1,0);
		if(this.plane == "down")
			var vector = new THREE.Vector3(0,1,0);
		
		//what object need create
		console.log("createObject");
		console.log(this.selectObjectName);
		if(this.selectObjectName == "wheel")
			this.createWheel(vector);
	},

	checkOnThePlane: function(pos) {
		// var furniture = this.selectFurniture;
		// while(furniture.parent.uuid != this.main.scene.uuid)
		// 	furniture = furniture.parent;
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

		if(this.plane == "front"){ // z+
			var tmp = parseFloat(furnitureCenter.z) + parseFloat(furnitureSize.z)/2;
			tmp = tmp.toFixed(4);
			if(pos.z >= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "back"){ //z-
			var tmp = parseFloat(furnitureCenter.z) - parseFloat(furnitureSize.z)/2;
			tmp = tmp.toFixed(4);
			if(pos.z <= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "left"){ //x-
			var tmp = parseFloat(furnitureCenter.x) - parseFloat(furnitureSize.x)/2;
			tmp = tmp.toFixed(4);
			if(pos.x <= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "right"){ //x+
			var tmp = parseFloat(furnitureCenter.x) + parseFloat(furnitureSize.x)/2;
			tmp = tmp.toFixed(4);
			if(pos.x >= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "up"){ //y+
			var tmp = parseFloat(furnitureCenter.y) + parseFloat(furnitureSize.y)/2;
			tmp = tmp.toFixed(4);
			if(pos.y >= tmp)
				return true;
			else
				return false;
		}
		else if(this.plane == "down"){ //y-
			var tmp = parseFloat(furnitureCenter.y) - parseFloat(furnitureSize.y)/2;
			tmp = tmp.toFixed(4);
			if(pos.y <= tmp)
				return true;
			else
				return false;
		}
	},

	updateWheelPosition: function(pos) {
		var furnitureCenter = this.getPartCenter(this.selectFurniture);
		var furnitureSize = this.getPartSize(this.selectFurniture);
		var isOnThePlane = this.checkOnThePlane(pos);
		if(isOnThePlane){
			// var isArea = this.checkWheelArea(pos);
			// console.log(isArea);
			// if(isArea)
				this.selectObject.position.set(pos.x, pos.y, pos.z);
			// else
				// console.log("Area isn't enough");
		}
		else
			console.log("Ray position isn't on the plan.");
	},

	updateObjectPosition: function(pos) {
		// if(position correct)
		// 	this.selectObject..position.set(pos.x, pos.y, pos.z);
		// else
		// 	console.log("miss");

		// control list
		if(this.selectObjectName == "wheel"){
			this.updateWheelPosition(pos);
		}
		// if(this.selectObjectName == "rod")
		// ...

		
	},

	execute: function( name ){
		this.init();
		var scope = this;
		$( ".item.ui.image.label.add.board" ).click( function() {
			scope.setAddObjectName("board");
        });
        $( ".item.ui.image.label.add.rod" ).click( function() {
        	scope.setAddObjectName("rod");
        });
        $( ".item.ui.image.label.add.seat" ).click( function() {
        	scope.setAddObjectName("seat");
        });
        $( ".item.ui.image.label.add.leg" ).click( function() {
        	scope.setAddObjectName("leg");
        });
        $( ".item.ui.image.label.add.wheel" ).click( function() {
        	scope.setAddObjectName("wheel");
        });
        $( ".item.ui.image.label.add.hook" ).click( function() {
        	scope.setAddObjectName("hook");
        });
        $( ".item.ui.image.label.add.drawer" ).click( function() {
        	scope.setAddObjectName("drawer");
        });
        $( ".item.ui.image.label.add.door" ).click( function() {		
			scope.setAddObjectName("door");
        }); 
	}
}

module.exports = Model_Add