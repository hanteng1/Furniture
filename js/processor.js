"use strict;"
//this is to handle the new design approaches
//that without the need of cad operations

const Chair_Align = require('./Chair_Align');
const Chair_Add = require('./Chair_Add');
const Chair_Rebuild = require('./Chair_Rebuild');


const Dresser_Add = require('./Dresser_Add');


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
	this.dresser_add = undefined;

	//end of zhuen's block



	//weixiang's bloack
	this.chair_rebuild = undefined;


	//end of weixiang's block




	//trif's block




	//end of trif's block


}

Processor.prototype = {

	init: function() {

		//determine which functions are available and get those functions ready
		var scope = this;


		switch(scope.category){

			case "chair" :
				if(scope.furnitures.length == 0) {
			
					return;

				}else if(scope.furnitures.length == 1){
					//possible actions with one furniture
					scope.chair_add = new Chair_Add(scope.main);
					scope.chair_add.init();
					scope.transformFunctions.CHAIR_ADD = scope.chair_add;

					scope.chair_rebuild = new Chair_Rebuild(scope.main);
					scope.transformFunctions.CHAIR_REBUILD = scope.chair_rebuild;
					
					scope.dresser_add = new Dresser_Add(scope.main);		
					scope.transformFunctions.DRESSER_ADD = scope.dresser_add;
					$('.operations.operation_dresser_add').show();


					$('.operations.operation_chair_add').show();
					$('.operations.operation_chair_rebuild').show();

				}else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					
					scope.chair_align = new Chair_Align(scope.main);
					scope.chair_align.init();
					scope.transformFunctions.CHAIR_ALIGN = scope.chair_align;
					
					//wei hsiang start
					scope.chair_rebuild = new Chair_Rebuild(scope.main);
					scope.transformFunctions.CHAIR_REBUILD = scope.chair_rebuild;
					//wei hsiang end
					
					$('.operations.operation_chair_align').show();
				}


				break;

			case "cabinent" :
				if(scope.furnitures.length == 0) {
			
					return;

				}else if(scope.furnitures.length == 1){
					//possible actions with one furniture					
					// scope.dresser_add = new Dresser_Add(scope.main);
					// scope.transformFunctions.DRESSER_ADD = scope.dresser_add;
					
					

				}else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					
					
					//wei hsiang end
					
					
				}

				break;


			case "table" :

				break;

		};

	},


	//execute design for chairs
	//based on which design button is pressed
	executeDesign: function(tfname, tfvalue) {		
		var scope = this;
		if(tfname in this.transformFunctions) {
			this.transformFunctions[tfname].execute(tfvalue);
		}

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
