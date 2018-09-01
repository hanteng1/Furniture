"use strict;"
const computeConvexHull = require('./computeConvexHull');
const cadExtrudeShapeIntersection = require('./cadExtrudeShapeIntersection');
const chairCutBack = require('./chairCutBack');

function Model_wrap(main){

	this.main = main;
    this.furnitures = main.furnitures;
    this.wrap_mode	= false; 

}

Model_wrap.prototype = {

	execute: function( name ){

        var main = this;
        var manager = new THREE.LoadingManager();
        var textureLoader = new THREE.TextureLoader( manager );

        $( ".item.ui.image.label.wrap1" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap1.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });
        $( ".item.ui.image.label.wrap2" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap2.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });
        $( ".item.ui.image.label.wrap3" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap3.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });
        $( ".item.ui.image.label.wrap4" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap4.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });
        $( ".item.ui.image.label.wrap5" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap5.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });
        $( ".item.ui.image.label.wrap6" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap6.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });
        $( ".item.ui.image.label.wrap7" ).click(function() {
            var texture = textureLoader.load( '../images/material/wrap/wrap7.jpg' );
            texture.repeat.set(0.1, 0.1);
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
            for(var i=0 ; i<main.main.GetSizeObj.length ; i++ ){
	            var model = main.main.GetSizeObj[i];
	            main.Wrap( model , texture );
	        }
            
        });

        if(this.wrap_mode == false){
        	$('#parameter_control_tool_wrap').show();
            this.wrap_mode = true;
        }
        else if(this.wrap_mode == true){
        	$('#parameter_control_tool_wrap').hide();
            this.wrap_mode = false;
        }
        $('#parameter_control_tool_painting').hide();

	},
	Wrap: function( model , texture ){

		var left_to_right = this.MakeExtrudeArray1(model, "yz" , "xy" );
		var back_to_front = this.MakeExtrudeArray2(model, "xy" , "yz" );
		var bottom_to_top = this.MakeExtrudeArray3(model, "xz" , "yz" );
		
		var geometry = cadExtrudeShapeIntersection( left_to_right[0], left_to_right[1] ,
													back_to_front[0], back_to_front[1] ,
													bottom_to_top[0], bottom_to_top[1] );
		
		var material = new THREE.MeshBasicMaterial( {map: texture,
        wireframe: false} );
		
		var backRest = new THREE.Mesh( geometry, material );
		
		this.main.WrapObject.push(backRest);
		this.main.scene.add( backRest );
		
	},

	getAllChildren: function(obj, array) {
        if (obj.children.length > 0) {
            for (var i = 0; i < obj.children.length; i++) {
                if(obj.children[i].type == "Mesh" || obj.children[i].type == "Object3D"){
                    this.getAllChildren(obj.children[i], array);
                }   
            }
        }
        else{
            array.push(obj);    
        }

    },

    getSize: function( model ) {
        var box = new THREE.Box3();
        box.setFromObject( model );
        var box_size = new THREE.Vector3();
        box.getSize(box_size);

        //this includes width, height, depth
        return box_size;
    },

    getCenterPosition: function( model ){
    	var box = new THREE.Box3();
		box.setFromObject( model );
		var center = new THREE.Vector3();
		box.getCenter(center);
		return center;
    },

    MakeExtrudeArray1: function( model , plane1 , plane2 ){
    	
    	var back_left_points = computeConvexHull( model , 'yz' ); //2d points
		//make it 3d
		var x_pos = this.getCenterPosition( model ).x - this.getSize( model ).x / 2;		
		var back_left_3d = [];
		for(var i = 0; i < back_left_points.length; i++) {
			var point = back_left_points[i];
			back_left_3d.push([x_pos, point[0], point[1]]);
		}

		//get top and its contour
		var back_whole_points = computeConvexHull( model , 'xy' ); //2d points
		var z_pos = this.getCenterPosition( model ).z - this.getSize( model ).z / 2;

		//get back top line , based on the vector directions and clockwise
		//assumption. sull returns points with the point at the top-right (largest x and largest y)
		var back_top_points = [];  //2d points for now
		var angle_offset = 20;
		var test_begin = false;
		var SetOrigiPoint = true;
		var x_rightpos = this.getCenterPosition( model ).x + this.getSize( model ).x/2;
		var x_lefttpos = this.getCenterPosition( model ).x - this.getSize( model ).x/2;
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
				//set the rightest point
				if(SetOrigiPoint == true ){
					if( point_1[0] < x_rightpos){
						back_top_points.push([ x_rightpos, point_1[1] ]);
					}
					SetOrigiPoint = false;
				}

				if(!back_top_points.includes(point_1)){
					back_top_points.push(point_1);
				}

				if(!back_top_points.includes(point_2)) {
					back_top_points.push(point_2);
				}
			}else{
				//todo.. this may not always working
				if(test_begin == true){
					if(x_lefttpos < point_1[0])
						back_top_points.push([ x_lefttpos, point_1[1] ]);
					break;
				}	
			}
		}
		// console.log(back_top_points);

		var back_extrude_3d = [];
		for(var i = 0; i < back_top_points.length; i++) {
			var point = back_top_points[i];
			back_extrude_3d.push([point[0], point[1], z_pos]);
		}
		

		return [back_left_3d , back_extrude_3d] ;
    },

    MakeExtrudeArray2: function( model , plane1 , plane2 ){
    	//												
    	var back_points = computeConvexHull( model , "xy" ); //2d points
		//make it 3d
		var z_pos = this.getCenterPosition( model ).z + this.getSize( model ).z / 2;		
		var back_3d = [];
		for(var i = 0; i < back_points.length; i++) {
			var point = back_points[i];
			back_3d.push([point[0], point[1], z_pos]);
		}

		//get top and its contour							
		var back_whole_points = computeConvexHull( model , "yz" ); //2d points
		var x_pos = this.getCenterPosition( model ).x - this.getSize( model ).x / 2;

		//get back top line , based on the vector directions and clockwise
		//assumption. sull returns points with the point at the top-right (largest x and largest y)
		var back_top_points = [];  //2d points for now
		var angle_offset = 20;
		var test_begin = false;
		var SetOrigiPoint = true;
		var z_backpos = this.getCenterPosition( model ).z - this.getSize( model ).z/2;
		var z_frontpos = this.getCenterPosition( model ).z + this.getSize( model ).z/2;
		var half_z = this.getSize( model ).z/2;
		for(var i = 0; i < back_whole_points.length - 1; i ++) {
			var point_1 = back_whole_points[i];
			var point_2 = back_whole_points[i + 1];

			var test_vector = new THREE.Vector2(back_whole_points[i + 1][1] - back_whole_points[i][1], 
												back_whole_points[i + 1][0] - back_whole_points[i][0]);
			
			//console.log(test_vector);
			var test_angle = test_vector.angle() * 180 / Math.PI;
			console.log(test_angle);
			//console.log(test_angle);
			if(test_angle > 180 - angle_offset && test_angle < 180 + angle_offset)
			{
				test_begin = true;
				//set the back pos
				if(SetOrigiPoint == true ){
					if( point_1[1] > z_backpos){
						back_top_points.push([ point_1[0] , z_backpos ]);
					}
					SetOrigiPoint = false;
				}
				if(!back_top_points.includes(point_1)){
					back_top_points.push(point_1);
				}

				if(!back_top_points.includes(point_2)) {
					back_top_points.push(point_2);
				}
			}else{
				//todo.. this may not always working
				if(test_begin == true){
					if(z_frontpos > point_1[1])
						back_top_points.push([ point_1[0] , z_frontpos ]);
					break;
				}	
			}
		}
		// console.log(back_top_points);

		var back_extrude_3d = [];
		for(var i = 0; i < back_top_points.length; i++) {
			var point = back_top_points[i];
			back_extrude_3d.push([x_pos, point[0], point[1]]);
		}


		return [back_3d , back_extrude_3d] ;
    },

    MakeExtrudeArray3: function( model , plane1 , plane2 ){
    	//												
    	var back_points = computeConvexHull( model , "xz" ); //2d points
		//make it 3d
		var y_pos = this.getCenterPosition( model ).y - this.getSize( model ).y / 2;		
		var back_3d = [];
		for(var i = 0; i < back_points.length; i++) {
			var point = back_points[i];
			back_3d.push([point[0], y_pos, point[1] ]);
		}

		//get top and its contour							
		var back_whole_points = computeConvexHull( model , "yz" ); //2d points
		var x_pos = this.getCenterPosition( model ).x + this.getSize( model ).x / 2;

		//get back top line , based on the vector directions and clockwise
		//assumption. sull returns points with the point at the top-right (largest x and largest y)
		var back_top_points = [];  //2d points for now
		var angle_offset = 20;
		var test_begin = false;
		var SetOrigiPoint = true;
		var y_toppos = this.getCenterPosition( model ).y + this.getSize( model ).y/2;
		var y_downpos = this.getCenterPosition( model ).y - this.getSize( model ).y/2;
		var half_z = this.getSize( model ).z/2;
		for(var i = 0; i < back_whole_points.length - 1; i ++) {
			var point_1 = back_whole_points[i];
			var point_2 = back_whole_points[i + 1];

			var test_vector = new THREE.Vector2(back_whole_points[i + 1][1] - back_whole_points[i][1], 
												back_whole_points[i + 1][0] - back_whole_points[i][0]);
			
			//console.log(test_vector);
			var test_angle = test_vector.angle() * 180 / Math.PI;
			console.log(test_angle);
			//console.log(test_angle);
			if(test_angle > 90 - angle_offset && test_angle < 90 + angle_offset)
			{
				test_begin = true;
				if(SetOrigiPoint == true ){
					if( point_1[0] < y_toppos){
						back_top_points.push([ y_toppos , point_1[1] ]);
					}
					SetOrigiPoint = false;
				}
				if(!back_top_points.includes(point_1)){
					back_top_points.push(point_1);
				}

				if(!back_top_points.includes(point_2)) {
					back_top_points.push(point_2);
				}
			}else{
				//todo.. this may not always working
				if(test_begin == true){
					if(y_downpos < point_1[0])
						back_top_points.push([ y_downpos , point_1[1] ]);
					break;
				}	
			}
		}
		// console.log(back_top_points);
		var y_size = this.getSize(model).y;
		var back_extrude_3d = [];
		for(var i = 0; i < back_top_points.length; i++) {
			var point = back_top_points[i];
			back_extrude_3d.push([x_pos, point[0], point[1]]);
		}


		return [back_3d , back_extrude_3d] ;
    }


}
function loadLine( main , point1 , point2){

		var material = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 100,
			linecap: 'round', //ignored by WebGLRenderer
			linejoin:  'round' //ignored by WebGLRenderer
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( point1.x , point1.y , point1.z ),
			new THREE.Vector3( point2.x , point2.y , point2.z )
		);

		var line = new THREE.Line( geometry, material );
		main.scene.add( line );
		main.SizeObj.push(line);
}

module.exports = Model_wrap