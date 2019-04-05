"use strict";
const Procedure_button = require('./Procedure_button');


function Model_Cut(main) {

	this.main = main;
	this.furnitures = main.furnitures;
	var scope = this;
	this.cut_mode = false;

	$('.item.ui.image.label.cut').click(function() {
		if(scope.main.furniture == null){
	    	alert('Please select the furniture first');
	    	return;
	    }

	    scope.main.Cutting = true;

	    if(scope.main.cutplane == null) {
	    	var geometry = new THREE.PlaneGeometry( 0.1, 0.1);
			var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
			scope.main.cutplane = new THREE.Mesh( geometry, material );
			scope.main.scene.add( scope.main.cutplane );
	    }

	    scope.main.component = null;
	    scope.main.intersectpoint = null;
	    scope.main.fixpointball = false;

	});

}


Model_Cut.prototype = {
	execute: function(name) {
		if(this.cut_mode == false && name=='cut'){

			//turn on the operation

            $('#parameter_control_tool_cut').show();
            this.cut_mode = true;
            this.main.processor.executeDesign("MODEL_ALIGN", "cut");
            this.main.processor.executeDesign("MODEL_WRAP", "cut");
            this.main.processor.executeDesign("MODEL_ROTATION", "cut");
            this.main.processor.executeDesign("MODEL_PAINTING", "cut");
            this.main.processor.executeDesign("MODEL_ADDBETWEEN", "cut");
            this.main.processor.executeDesign("MODEL_ADD", "cut");

            //creat procedure button
            if(this.main.stepOperationName != name){
                this.DeleteButton();
                Procedure_button( this.main, this.main.stepOperationName );
                //record the operation name
                this.main.stepOperationName = name;
            }


        }else if(this.cut_mode == true || name!= 'cut'){

        	//turn off the operation

            $('#parameter_control_tool_cut').hide();

            this.main.component = null;
    		this.main.intersectpoint = null;
    		this.main.fixpointball = false;
            this.main.SelectComponent = false;
            this.cut_mode = false;
            if(this.main.cutplane != null)
            	this.main.scene.remove(this.main.cutplane);
            this.main.cutplane = null;
            this.main.selectionBox.visible = false;
			this.main.transformControls.detach();
        }
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


function AddCutPlaneMousePosi1(main){
	//if user not select the furniture component, return
	if (main.component == null){
		return;
	}
	main.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	main.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera( main.mouse, main.camera );
	var intersects = raycaster.intersectObject(main.component);
	if(intersects.length > 0){
		main.intersectpoint = intersects[0];
		var pos = intersects[0].point;
		//let the red point move to mouse position
		if(main.fixpointball==false){
			main.cutplane.position.set( pos.x, pos.y, pos.z );
			//set normal vector from local to world
			var normalMatrix = new THREE.Matrix3().getNormalMatrix( main.intersectpoint.object.matrixWorld );
			var normal = intersects[0].face.normal
			normal = normal.clone().applyMatrix3( normalMatrix ).normalize();
			//rotate the point
			var newDir = new THREE.Vector3().addVectors(pos, normal);

			main.cutplane.lookAt( newDir );


			if(main.cutplaneDirection == 0)
			{
				main.cutplane.rotateX(90* Math.PI/180);
			}else if(main.cutplaneDirection == 1)
			{
				main.cutplane.rotateY(90* Math.PI/180);
			}else if(main.cutplaneDirection == 2)
			{
				main.cutplane.rotateZ(90* Math.PI/180);
			}		
			

			//to do... make a reasonable size
			main.cutplane.scale.set(4.0, 4.0, 4.0);
			
		}
		//console.log(pos);
	}
	else{
		//console.log("miss");
	}
	
}


function AddCutPlaneComponent(main) {

	var intersects = main.getIntersects( main.onUpPosition, main.furniture.getObjects());

	if ( intersects.length > 0 ) {

		if(main.customControl.mouseWheelDisabled == false)
			main.customControl.mouseWheelDisabled = true;

		var object = intersects[ 0 ].object;
		//if select the same component, record the click position
		if(main.component == object){
			main.fixpointball = true;
			main.AddCutPlaneFunc();
		}

		if ( object.userData.object !== undefined ) {
			main.select( object.userData.object );
			main.component = object.userData.object;
		} else {
			main.select( object );
			main.component = object;
		}
	} else {
		//it also calls select, to detach
		main.select( null );


		if(main.customControl.mouseWheelDisabled == true)
			main.customControl.mouseWheelDisabled = false;

	}

}







module.exports = {Model_Cut, AddCutPlaneMousePosi1, AddCutPlaneComponent}