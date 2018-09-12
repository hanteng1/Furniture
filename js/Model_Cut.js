"use strict";



function Model_Cut(main) {

	this.main = main;
	this.furnitures = main.furnitures;
	var scope = this;
	this.cut_mode = false;

	$('.item.ui.image.label.cut.vertical').click(function() {
		if(scope.main.furniture == null){
	    	alert('Please select the furniture first');
	    	return;
	    }

	    scope.main.SelectComponent = true;

	    if(scope.main.cutplane == null) {
	    	var geometry = new THREE.PlaneBufferGeometry( 1, 1);
			var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
			scope.main.cutplane = new THREE.Mesh( geometry, material );
			scope.main.scene.add( scope.main.cutplane );
	    }

	    scope.main.component = null;
	    scope.main.intersectpoint = null;
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
}


module.exports = Model_Cut