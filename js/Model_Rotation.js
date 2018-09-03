"use strict;"

function Model_Rotation(main){

	this.main = main;
    this.furnitures = main.furnitures;
    this.Rotation_mode = false; 

}

Model_Rotation.prototype = {

	execute: function( name ){
		var scope = this;

		$( ".item.ui.image.label.rota1" ).click(function() {
			
			for(var i=0 ; i<scope.main.GetSizeObj.length ; i++ ){
	            var model = scope.main.GetSizeObj[i];
				scope.objectRotationByAxis( model, 'x' , 90 );
	        }
        });
        $( ".item.ui.image.label.rota2" ).click(function() {

			for(var i=0 ; i<scope.main.GetSizeObj.length ; i++ ){
	            var model = scope.main.GetSizeObj[i];
				scope.objectRotationByAxis( model, 'x' , -90 );
	        }
        });
        $( ".item.ui.image.label.rota3" ).click(function() {

			for(var i=0 ; i<scope.main.GetSizeObj.length ; i++ ){
	            var model = scope.main.GetSizeObj[i];
				scope.objectRotationByAxis( model, 'z' , 90 );
	        }
        });
        $( ".item.ui.image.label.rota4" ).click(function() {

			for(var i=0 ; i<scope.main.GetSizeObj.length ; i++ ){
	            var model = scope.main.GetSizeObj[i];
				scope.objectRotationByAxis( model, 'z' , -90 );
	        }
        });
        $( ".item.ui.image.label.rota5" ).click(function() {

			for(var i=0 ; i<scope.main.GetSizeObj.length ; i++ ){
	            var model = scope.main.GetSizeObj[i];
				scope.objectRotationByAxis( model, 'y' , 90 );
	        }
        });
        $( ".item.ui.image.label.rota6" ).click(function() {

			for(var i=0 ; i<scope.main.GetSizeObj.length ; i++ ){
	            var model = scope.main.GetSizeObj[i];
				scope.objectRotationByAxis( model, 'y' , -90 );
	        }
        });


		if(this.Rotation_mode == false){
        	$('#parameter_control_tool_rotation').show();
            this.Rotation_mode = true;
        }
        else if(this.Rotation_mode == true){
        	$('#parameter_control_tool_rotation').hide();
            this.Rotation_mode = false;
        }
        $('#parameter_control_tool_painting').hide();
        $('#parameter_control_tool_wrap').hide();
        $('#parameter_control_tool_align').hide();
	},

	objectRotationByAxis: function(obj, axis, degree){
		var center = this.getCenterPosition(obj);
		var size = this.getSize(obj);
		//rotation
		if(axis == 'x'){			 
			obj.rotateOnWorldAxis(new THREE.Vector3(1,0,0), degree* Math.PI/180);			
		}
		else if(axis == 'y'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,1,0), degree* Math.PI/180);
		}
		else if(axis == 'z'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,0,1), degree* Math.PI/180);
		}

		var newCenter = this.getCenterPosition(obj);
		var offset = new THREE.Vector3().subVectors(center, newCenter);
		
		//if obj is furniture's component
		if(obj.parent != this.main.scene){
			var position = new THREE.Vector3();
			var quaternion = new THREE.Quaternion();
			var scale = new THREE.Vector3();
			obj.matrixWorld.decompose(position, quaternion, scale);
			quaternion.inverse();
			offset.applyQuaternion(quaternion);
			obj.translateX( offset.x/scale.x );
			obj.translateY( offset.y/scale.y );
			obj.translateZ( offset.z/scale.z );
		}
		else{//if obj is furniture
			var newPosi = new THREE.Vector3().addVectors(obj.position,offset);
			var newSize = this.getSize(obj);
			obj.position.set( newPosi.x, newPosi.y +(newSize.y-size.y)/2, newPosi.z );

		}
		
		
	},

    getCenterPosition: function( model ){
    	var box = new THREE.Box3();
		box.setFromObject( model );
		var center = new THREE.Vector3();
		box.getCenter(center);
		return center;
    },

    getSize: function( model ) {
        var box = new THREE.Box3();
        box.setFromObject( model );
        var box_size = new THREE.Vector3();
        box.getSize(box_size);

        //this includes width, height, depth
        return box_size;
    }



}

module.exports = Model_Rotation