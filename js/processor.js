"use strict;"
//this is to handle the new design approaches
//that without the need of cad operations

const Chair_Align = require('./Chair_Align')

function Processor(main) {
	this.main = main;
	this.category = main.category;  //chair, cabinet, table
	this.furnitures = main.furnitures;


	//variables of transformation functions
	//chair
	this.chair_align = undefined;
	this.chair_add = undefined;



	this.transformFunctions = { };



	//zhuen's block



	//end of zhuen's block



	//weixiang's bloack



	//end of weixiang's block




	//trif's block




	//end of trif's block


}

Processor.prototype = {

	init: function() {
		var scope = this;

		//initialize chair transformers
		scope.chair_align = new Chair_Align(scope.main);
		scope.chair_align.init();
		this.transformFunctions.CHAIR_ALIGN = scope.chair_align;



	},


	//execute design for chairs
	executeDesign: function() {
		
		var scope = this;

		switch(scope.category){

			case "chair" :
				if(scope.furnitures.length == 0) {
			
					return;

				}else if(scope.furnitures.length == 1){
					//possible actions with one furniture


				}else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					this.chair_align.execute();

				}


				break;

			case "cabinent" :


				break;


			case "table" :

				break;

		};

	},


	changeParameterValue: function(tfname, pname, value) {

		if(tfname in this.transformFunctions) {
			this.transformFunctions[tfname].changeParameterValue(pname, value);

			//console.log(this.transformFunctions[tfname]);
		}
		
	}



	//zhuen's block



	//end of zhuen's block



	//weixiang's bloack



	//end of weixiang's block




	//trif's block




	//end of trif's block



}


module.exports = Processor
