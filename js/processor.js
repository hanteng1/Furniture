"use strict;"
//this is to handle the new design approaches
//that without the need of cad operations

const Chair_Align = require('./Chair_Align');
const Chair_Add = require('./Chair_Add');
const Chair_Rebuild = require('./Chair_Rebuild');
const Cabinet_kallax = require('./Cabinet_kallax');
const Dresser_Add = require('./Dresser_Add');

const Table = require('./Table');
const Desk = require('./Desk');


const Model_Painting = require('./Model_Painting');
const Model_wrap = require('./Model_wrap');
const Model_Rotation = require('./Model_Rotation');
const Model_Align = require('./Model_Align');
const Model_Add = require('./Model_Add');

const {Model_AddBetween , AddRodMousePosi1, AddRodMousePosi2,
	SelectFurniComponent, SelectFurni} = require('./Model_AddBetween');

const {Model_Cut,  AddCutPlaneMousePosi1, AddCutPlaneComponent} = require('./Model_Cut'); 


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
	this.table = undefined;
	this.desk = undefined;
	this.model_add = undefined;
	//end of zhuen's block



	//weixiang's bloack
	this.chair_rebuild = undefined;
	this.cabinet_kallax = undefined;
	this.model_painting = undefined;
	this.model_wrap = undefined;
	this.model_rotation = undefined;
	this.model_align = undefined;
	this.model_addbetween = undefined;
	this.model_cut = undefined;



}

Processor.prototype = {

	init: function() {

		//determine which functions are available and get those functions ready
		var scope = this;


		switch(this.main.category){

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

					$('.operations.operation_chair_add').show();
					$('.operations.operation_chair_rebuild').show();

				}else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					
					scope.chair_align = new Chair_Align(scope.main);
					scope.chair_align.init();
					scope.transformFunctions.CHAIR_ALIGN = scope.chair_align;
					
					//wei hsiang start
					//scope.chair_rebuild = new Chair_Rebuild(scope.main);
					//scope.transformFunctions.CHAIR_REBUILD = scope.chair_rebuild;
					//wei hsiang end
					
					$('.operations.operation_chair_align').show();


					//zhuen's block
					
					//end of zhuen's block
				}


				break;

			case "cabinet" :
				if(scope.furnitures.length == 0) {
			
					return;

				}else if(scope.furnitures.length == 1){
					//possible actions with one furniture
					scope.cabinet_kallax = new Cabinet_kallax(scope.main);
					scope.transformFunctions.CABINET_LALLAX = scope.cabinet_kallax;
					$('.operations.operation_cabinet_kallax_one').show();
					

					
				}else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					scope.cabinet_kallax = new Cabinet_kallax(scope.main);
					scope.transformFunctions.CABINET_LALLAX = scope.cabinet_kallax;						
					$('.operations.operation_cabinet_kallax_two').show();
					
				}

				break;


			case "table" :
				if(scope.furnitures.length == 0) {
			
					return;

				}
				else if(scope.furnitures.length == 1){
					//possible actions with one furniture					
					
					scope.table = new Table(scope.main);
					scope.transformFunctions.TABLE = scope.table;						
					$('.operations.operation_table').show();

				}
				else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures

					
					scope.table = new Table(scope.main);
					scope.transformFunctions.TABLE = scope.table;						
					$('.operations.operation_table').show();

				}
				break;

			case "desk" :
				if(scope.furnitures.length == 0) {
					return;
				}
				else if(scope.furnitures.length == 1){
					//possible actions with one furniture
					scope.desk = new Desk(scope.main);
					scope.transformFunctions.DESK = scope.desk;						
					$('.operations.operation_desk').show();

				}
				else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					scope.desk = new Desk(scope.main);
					scope.transformFunctions.DESK = scope.desk;						
					$('.operations.operation_desk').show();
				}

				break;

			case "dresser" :
				if(scope.furnitures.length == 0) {
					return;
				}
				else if(scope.furnitures.length == 1){
					//possible actions with one furniture
					scope.dresser_add = new Dresser_Add(scope.main);		
					scope.transformFunctions.DRESSER_ADD = scope.dresser_add;
					$('.operations.operation_dresser_add').show();

				}
				else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					scope.dresser_add = new Dresser_Add(scope.main);		
					scope.transformFunctions.DRESSER_ADD = scope.dresser_add;
					$('.operations.operation_dresser_add').show();
				}

				break;

			case "tool" :
				scope.model_painting = new Model_Painting(scope.main);
				scope.transformFunctions.MODEL_PAINTING = scope.model_painting;
				
				scope.model_wrap = new Model_wrap(scope.main);
				scope.transformFunctions.MODEL_WRAP = scope.model_wrap;
				
				scope.model_rotation = new Model_Rotation(scope.main);
				scope.transformFunctions.MODEL_ROTATION = scope.model_rotation;
				
				scope.model_align = new Model_Align(scope.main);
				scope.transformFunctions.MODEL_ALIGN = scope.model_align;

				//add
				scope.model_add = new Model_Add(scope.main);
				scope.transformFunctions.MODEL_ADD = scope.model_add;

				//addbetween
				scope.model_addbetween = new Model_AddBetween(scope.main);
				scope.transformFunctions.MODEL_ADDBETWEEN = scope.model_addbetween;

				//cut
				scope.model_cut = new Model_Cut(scope.main);
				scope.transformFunctions.MODEL_CUT = scope.model_cut;
				
				$('.operations.operation_tool').show();		
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


}


module.exports = Processor
