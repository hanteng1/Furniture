"use strict;"
const Procedure_button = require('./Procedure_button');

function Model_AddBetween( main ){

    this.main = main;
    this.furnitures = main.furnitures;
    this.addbetween_mode = false;
    var scope = this;
    
    $( ".item.ui.image.label.addbetween.rod" ).click(function() {
        //console.log(document.getElementById('InputRodRadius').value);
        //check select furniture or not
        if(scope.main.furniture == null){
        	alert('Please select the furniture first');
        	return;
        }
        $('.ui.right.labeled.input.rod').show();
        scope.main.SelectComponent = true;
        //add the point ball to scene
        
        if(scope.main.pointball == null){
        	var geometry = new THREE.CylinderGeometry( 0.1, 0.1, 0.01, 32 );;
			var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
			scope.main.pointball = new THREE.Mesh( geometry, material );
			scope.main.scene.add( scope.main.pointball );
        }
        
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
            $('.ui.right.labeled.input.rod').hide();
            document.getElementById('InputRodRadius').value = "";
            this.main.component = null;
    		this.main.intersectpoint = null;
    		this.main.fixpointball = false;
            this.main.SelectComponent = false;
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
module.exports = Model_AddBetween

