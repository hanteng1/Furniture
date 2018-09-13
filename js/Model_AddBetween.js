"use strict;"
const Procedure_button = require('./Procedure_button');

function Model_AddBetween( main ){

    this.main = main;
    this.furnitures = main.furnitures;
    this.addbetween_mode = false;
    var scope = this;
    
    $( ".item.ui.image.label.addbetween.rod" ).click(function() {
        
        //check select furniture or not
        if(scope.main.furniture == null && 
        	scope.main.onCtrl == false){
        	alert('Please select the furniture first');
        	return;
        }
        //check user selected furniture number if they want to
        //select two furniture
        if(scope.main.onCtrl == true && 
        	scope.main.DistanceObj.length != 2 ){
        	alert('Please select two furniture ');
        	return;
        }

        scope.main.Addrod = true;
        //add the point ball to scene
        
        if(scope.main.pointball == null){
        	var geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.01, 32 );;
			var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
			scope.main.pointball = new THREE.Mesh( geometry, material );
			scope.main.scene.add( scope.main.pointball );
        }

        $('#AddRodInput').show();
    	scope.main.component = null;
    	scope.main.intersectpoint = null;
    	scope.main.fixpointball = false;
        
    });
    	
    
}
Model_AddBetween.prototype = {

	execute: function( name ){

        if(this.addbetween_mode == false && name=='addbetween'){
            $('#parameter_control_tool_addbetween').show();
            this.addbetween_mode = true;
            this.main.processor.executeDesign("MODEL_ALIGN", "addbetween");
            this.main.processor.executeDesign("MODEL_WRAP", "addbetween");
            this.main.processor.executeDesign("MODEL_ROTATION", "addbetween");
            this.main.processor.executeDesign("MODEL_PAINTING", "addbetween");
            this.main.processor.executeDesign("MODEL_CUT", "addbetween");

            //creat procedure button
            if(this.main.stepOperationName != name){
                this.DeleteButton();
                Procedure_button( this.main, this.main.stepOperationName );
                //record the operation name
                this.main.stepOperationName = name;
            }
        }
        else if(this.addbetween_mode == true || name!= 'addbetween'){
            $('#parameter_control_tool_addbetween').hide();
            $('#AddRodInput').hide();
            document.getElementById('InputRodRadius').value = "";
            this.main.component = null;
    		this.main.intersectpoint = null;
    		this.main.fixpointball = false;
            this.main.Addrod = false;
            this.addbetween_mode = false;
            if(this.main.pointball != null)
            	this.main.scene.remove(this.main.pointball);
            this.main.pointball = null;
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
//add rod inside the furniture
function AddRodMousePosi1(main){
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
			main.pointball.position.set( pos.x, pos.y, pos.z );
			//set normal vector from local to world
			var normalMatrix = new THREE.Matrix3().getNormalMatrix( main.intersectpoint.object.matrixWorld );
			var normal = intersects[0].face.normal
			normal = normal.clone().applyMatrix3( normalMatrix ).normalize();
			//rotate the point
			var newDir = new THREE.Vector3().addVectors(pos, normal);
			main.pointball.lookAt( newDir );
			main.pointball.rotateX(90* Math.PI/180);
			var radius = document.getElementById('InputRodRadius').value;
			if(radius == "")
				main.pointball.scale.set(2.0, 1, 2.0);
			else
				main.pointball.scale.set(parseFloat(radius), 1, parseFloat(radius));
		}
		//console.log(pos);
	}
	else{
		//console.log("miss");
	}
	

}
//add rod inside the furniture
function AddRodMousePosi2(main){
	
	main.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	main.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera( main.mouse, main.camera );
	//select the adding position from these two furnitures
	var intersects = raycaster.intersectObjects(main.DistanceObj , true);

	if(intersects.length > 0){
		main.intersectpoint = intersects[0];
		var pos = intersects[0].point;
		//let the red point move to mouse position
		if(main.fixpointball==false){
			main.pointball.position.set( pos.x, pos.y, pos.z );
			//set normal vector from local to world
			var normalMatrix = new THREE.Matrix3().getNormalMatrix( main.intersectpoint.object.matrixWorld );
			var normal = intersects[0].face.normal
			normal = normal.clone().applyMatrix3( normalMatrix ).normalize();
			//rotate the point
			var newDir = new THREE.Vector3().addVectors(pos, normal);
			main.pointball.lookAt( newDir );
			main.pointball.rotateX(90* Math.PI/180);
			var radius = document.getElementById('InputRodRadius').value;
			if(radius == "")
				main.pointball.scale.set(2.0, 1, 2.0);
			else
				main.pointball.scale.set(parseFloat(radius), 1, parseFloat(radius));
		}
		//console.log(pos);
	}
	else{
		//console.log("miss");
	}
	

}
//select furniture component to add rod
function SelectFurniComponent(main){

	var intersects = main.getIntersects( main.onUpPosition, main.furniture.getObjects());

	if ( intersects.length > 0 ) {

		var object = intersects[ 0 ].object;
		//if select the same component, record the click position
		if(main.component == object){
			main.fixpointball = true;
			main.AddRodFunc();
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
	}

}
//select furniture to add rod
function SelectFurni(main){
	
	for(var i = 0; i < main.DistanceObj.length; i++) {
		var intersects = main.getIntersect( main.onUpPosition, 
											main.DistanceObj[i]);
		if ( intersects.length > 0 ) {

			main.fixpointball = true;
			main.AddRodFunc();
			break;
		}
	}

}

module.exports = {Model_AddBetween , AddRodMousePosi1, AddRodMousePosi2,
				 SelectFurniComponent, SelectFurni}

