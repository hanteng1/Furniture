"use strict;"

function Model_Align(main){

	this.main = main;
    this.furnitures = main.furnitures;
    this.Align_mode = false; 

}

Model_Align.prototype = {

	execute: function( name ){
		var scope = this;

		$( ".item.ui.image.label.align1" ).click(function() {
			if(scope.main.onCtrl == true && scope.main.DistanceObj.length==2){
				scope.AlignFurniture('x');
			}
			if(scope.main.onCtrlE == true){
				scope.AlignComponent('x');
			}
			
        });
        $( ".item.ui.image.label.align2" ).click(function() {
        	if(scope.main.onCtrl == true && scope.main.DistanceObj.length==2){
				scope.AlignFurniture('y');
			}
			if(scope.main.onCtrlE == true){
				scope.AlignComponent('y');
			}
			
        });
        $( ".item.ui.image.label.align3" ).click(function() {
        	if(scope.main.onCtrl == true && scope.main.DistanceObj.length==2){
				scope.AlignFurniture('z');
			}
			if(scope.main.onCtrlE == true){
				scope.AlignComponent('z');
			}
			
        });


		if(this.Align_mode == false){
        	$('#parameter_control_tool_align').show();
            this.Align_mode = true;
        }
        else if(this.Align_mode == true){
        	$('#parameter_control_tool_align').hide();
            this.Align_mode = false;
        }
        $('#parameter_control_tool_painting').hide();
        $('#parameter_control_tool_wrap').hide();
        $('#parameter_control_tool_rotation').hide();
	},

	AlignFurniture: function( mode ){

		var group = new THREE.Group();
		var TotalSize = new THREE.Vector3();

		//creat a group with all cloned furniture
		for(var i=0 ; i<this.main.DistanceObj.length ; i++ ){
			//var model = new THREE.Object3D;
            var model = this.main.DistanceObj[i].clone();
            TotalSize = new THREE.Vector3().addVectors(TotalSize,this.getSize(model));
			group.add(model);
        }

        var GroupSize = this.getSize(group);
        console.log(GroupSize);
        for(var i = group.length ; i > 0 ; i-- ){
            group.remove(group.children[i]);
        }

        //if not overlapping, then align
        if(mode == 'x' && GroupSize.x > TotalSize.x ){
        	
        	for(var i=1 ; i<this.main.DistanceObj.length ; i++ ){
	            var model = this.main.DistanceObj[i-1];
	            var setmodel = this.main.DistanceObj[i];
	            var diff = new THREE.Vector3().subVectors(this.getCenterPosition(model),
	            										  this.getCenterPosition(setmodel));
	            var newposition = new THREE.Vector3().addVectors(setmodel.position, diff);
	            setmodel.position.set(setmodel.position.x, newposition.y, newposition.z);
	        }
        }
        else if(mode == 'y' && GroupSize.y > TotalSize.y ){
        	
        	for(var i=1 ; i<this.main.DistanceObj.length ; i++ ){
	            var model = this.main.DistanceObj[i-1];
	            var setmodel = this.main.DistanceObj[i];
	            var diff = new THREE.Vector3().subVectors(this.getCenterPosition(model),
	            										  this.getCenterPosition(setmodel));
	            var newposition = new THREE.Vector3().addVectors(setmodel.position, diff);
	            setmodel.position.set(newposition.x, setmodel.position.y, newposition.z);
	        }
        }
        else if(mode == 'z' && GroupSize.z > TotalSize.z ){

        	for(var i=1 ; i<this.main.DistanceObj.length ; i++ ){
	            var model = this.main.DistanceObj[i-1];
	            var setmodel = this.main.DistanceObj[i];
	            var diff = new THREE.Vector3().subVectors(this.getCenterPosition(model),
	            										  this.getCenterPosition(setmodel));
	            var newposition = new THREE.Vector3().addVectors(setmodel.position, diff);
	            setmodel.position.set(newposition.x, newposition.y, setmodel.position.z);
	        }
        }
        

	},

	AlignComponent: function( mode ){

		var group = new THREE.Group();
		var TotalSize = new THREE.Vector3();

		//creat a group with all cloned furniture
		for(var i=0 ; i<this.main.GetSizeObj.length ; i++ ){
            var model = this.main.GetSizeObj[i].clone();
            TotalSize = new THREE.Vector3().addVectors(TotalSize,this.getSize(model));
			group.add(model);
        }

        var GroupSize = this.getSize(group);
        for(var i = group.length ; i>0 ; i-- ){
            group.remove(group.children[i]);
        }
        //if not overlapping, then align
        if(mode == 'x' && GroupSize.x > TotalSize.x && this.main.GetSizeObj.length>1 ){
        	
        	for(var i=1 ; i<this.main.GetSizeObj.length ; i++ ){
	            var model = this.main.GetSizeObj[i-1];
	            var setmodel = this.main.GetSizeObj[i];
	            var offset = new THREE.Vector3().subVectors(this.getCenterPosition(model),
	            											this.getCenterPosition(setmodel));
				var position = new THREE.Vector3();
				var quaternion = new THREE.Quaternion();
				var scale = new THREE.Vector3();
				model.matrixWorld.decompose(position, quaternion, scale);
				quaternion.inverse();
				offset.applyQuaternion(quaternion);
				setmodel.translateY( offset.y/scale.y );
				setmodel.translateZ( offset.z/scale.z );
	        }
        }
        else if(mode == 'y' && GroupSize.y > TotalSize.y && this.main.GetSizeObj.length>1 ){
        	
        	for(var i=1 ; i<this.main.GetSizeObj.length ; i++ ){
	            var model = this.main.GetSizeObj[i-1];
	            var setmodel = this.main.GetSizeObj[i];
	            var offset = new THREE.Vector3().subVectors(this.getCenterPosition(model),
	            											this.getCenterPosition(setmodel));
				var position = new THREE.Vector3();
				var quaternion = new THREE.Quaternion();
				var scale = new THREE.Vector3();
				model.matrixWorld.decompose(position, quaternion, scale);
				quaternion.inverse();
				offset.applyQuaternion(quaternion);
				setmodel.translateX( offset.x/scale.x );
				setmodel.translateZ( offset.z/scale.z );

	        }
        }else if(mode == 'z' && GroupSize.z > TotalSize.z && this.main.GetSizeObj.length>1 ){
        	
        	for(var i=1 ; i<this.main.GetSizeObj.length ; i++ ){
	            var model = this.main.GetSizeObj[i-1];
	            var setmodel = this.main.GetSizeObj[i];
	            var offset = new THREE.Vector3().subVectors(this.getCenterPosition(model),
	            											this.getCenterPosition(setmodel));
				var position = new THREE.Vector3();
				var quaternion = new THREE.Quaternion();
				var scale = new THREE.Vector3();
				model.matrixWorld.decompose(position, quaternion, scale);
				quaternion.inverse();
				offset.applyQuaternion(quaternion);
				setmodel.translateX( offset.x/scale.x );
				setmodel.translateY( offset.y/scale.y );

	        }
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




}

module.exports = Model_Align