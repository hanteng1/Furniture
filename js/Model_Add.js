"use strict;"

const computeConvexHull = require('./computeConvexHull')

function Model_Add(main){
	this.main = main;
    this.furnitures = main.furnitures;
    this.Add_mode = false;
}

Model_Add.prototype = {

	test: function(pos1) {
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var cube = new THREE.Mesh( geometry, material );
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

	execute: function( name ){

		var obj = this.furnitures[0].getFurniture();
		var tabletop = obj.getObjectByName("tabletop");
		console.log(tabletop);
		// 0-----1   4-----5
		// | up  |   | down|
		// |     |   |     |
		// 3-----2   7-----6
		var obj = this.main.GetSizeObj[0];
		var obj_points = this.getAllCorners(obj);

		var geometry = new THREE.Geometry();
		
		geometry.vertices.push(obj_points[0], obj_points[3], obj_points[7], obj_points[4], obj_points[0]);
		
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var tmp = new THREE.Line( geometry, material);
		tmp.position.x -= 1;
		this.main.scene.add( tmp );

		$( ".item.ui.image.label.add.board" ).click(function() {
			console.log("add.board");
        });
        $( ".item.ui.image.label.add.rod" ).click(function() {
        	console.log("add.rod");
        });
        $( ".item.ui.image.label.add.seat" ).click(function() {
        	console.log("add.seat");
        });
        $( ".item.ui.image.label.add.leg" ).click(function() {
        	console.log("add.leg");
        });
        $( ".item.ui.image.label.add.wheel" ).click(function() {
        	console.log("add.wheel");
        });
        $( ".item.ui.image.label.add.hook" ).click(function() {
        	console.log("add.hook");
        });
        $( ".item.ui.image.label.add.drawer" ).click(function() {
        	console.log("add.drawer");
        });
        $( ".item.ui.image.label.add.door" ).click(function() {
			console.log("add.door");
        });


		if(this.Add_mode == false){
        	$('#parameter_control_tool_add').show();
            this.Add_mode = true;
        }
        else if(this.Add_mode == true){
        	$('#parameter_control_tool_add').hide();
            this.Add_mode = false;
        }
        $('#parameter_control_tool_painting').hide();
        $('#parameter_control_tool_wrap').hide();
        $('#parameter_control_tool_align').hide();
	}
}

module.exports = Model_Add