"use strict;"
//this is to handle the new design approaches
//that without the need of cad operations

const Chair_Align = require('./Chair_Align')
const Chair_Add = require('./Chair_Add')

function Processor(main) {
	this.main = main;
	this.category = main.category;  //chair, cabinet, table
	this.furnitures = main.furnitures;


	//variables of transformation functions
	//chair
	this.chair_align = undefined;
	



	this.transformFunctions = { };



	//zhuen's block
	this.chair_add = undefined;


	//end of zhuen's block



	//weixiang's bloack
	this.chair_rebuild = undefined;


	//end of weixiang's block




	//trif's block




	//end of trif's block


}

Processor.prototype = {

	init: function() {
		var scope = this;

		//initialize chair transformers
		scope.chair_align = new Chair_Align(scope.main);
		this.transformFunctions.CHAIR_ALIGN = scope.chair_align;

		scope.chair_add = new Chair_Add(scope.main);
		this.transformFunctions.CHAIR_ADD = scope.chair_add;

		//scope.chair_rebuild = new Chair_Rebuild(scope.main);
		//this.transformFunctions.CHAIR_REBUILD = scope.chair_rebuild;


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
					this.chair_add.execute();
					//this.chair_rebuild.execute();

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
