"use strict;"
const Procedure_button = require('./Procedure_button');

function Model_AddBetween( main ){

    this.main = main;
    this.furnitures = main.furnitures;
    this.addbetween_mode = false;
    var scope = this;
    
    $( ".item.ui.image.label.addbetween.rod" ).click(function() {
        console.log('AddRod');
        
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
            this.addbetween_mode = false;
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

