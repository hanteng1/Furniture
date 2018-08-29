"use strict;"
const computeConvexHull = require('./computeConvexHull');
const cadExtrudeShape = require('./cadExtrudeShape');
const chairCutBack = require('./chairCutBack');

function Model_wrap( main , furniture , label , texture ){

	//get back and its contour
	var back_left = furniture.getComponentInName( label , "left");
	var back_left_points = computeConvexHull(back_left, "yz"); //2d points

	//make it 3d
	var x_pos = furniture.getComponentCenterPosition( label ).x - furniture.getComponentSize( label ).x / 2;		

	var back_left_3d = [];
	for(var i = 0; i < back_left_points.length; i++) {
		var point = back_left_points[i];
		back_left_3d.push([x_pos, point[0], point[1]]);
	}

	//get top and its contour
	var back_whole = furniture.getComponentByName(label);
	var back_whole_points = computeConvexHull(back_whole, "xy"); //2d points

	var z_pos = furniture.getComponentCenterPosition(label).z - furniture.getComponentSize(label).z / 2;

	//get back top line ,, based on the vector directions and clockwise
	//assumption. sull returns points with the point at the top-right (largest x and largest y)
	var back_top_points = [];  //2d points for now
	var angle_offset = 20;
	var test_begin = false;
	for(var i = 0; i < back_whole_points.length - 1; i ++) {
		var point_1 = back_whole_points[i];
		var point_2 = back_whole_points[i + 1];

		var test_vector = new THREE.Vector2(back_whole_points[i + 1][0] - back_whole_points[i][0], 
											back_whole_points[i + 1][1] - back_whole_points[i][1]);
		
		//console.log(test_vector);
		var test_angle = test_vector.angle() * 180 / Math.PI;

		//console.log(test_angle);

		if(test_angle > 180 - angle_offset && test_angle < 180 + angle_offset)
		{
			test_begin = true;
			if(!back_top_points.includes(point_1)){
				back_top_points.push(point_1);
			}

			if(!back_top_points.includes(point_2)) {
				back_top_points.push(point_2);
			}
		}else{
			//todo.. this may not always working
			if(test_begin == true){
				break;
			}	
		}
	}
	console.log("step 2");
	// console.log(back_top_points);

	var back_extrude_3d = [];
	for(var i = 0; i < back_top_points.length; i++) {
		var point = back_top_points[i];
		back_extrude_3d.push([point[0], point[1], z_pos]);
	}
	console.log("step 3");
	//generate shape
	var geometry = cadExtrudeShape(back_left_3d, back_extrude_3d);
	var material = new THREE.MeshBasicMaterial( {map: texture} );
	console.log("step 4");
	var backRest = new THREE.Mesh( geometry, material );

	main.scene.add( backRest );

}

module.exports = Model_wrap