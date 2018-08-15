"use strict;"

function Dresser_Add (main){
	this.main = main;
	this.furnitures = main.furnitures;
}


Dresser_Add.prototype = {
	checkHasTopFront: function(furniture) {		
		return furniture.hasComponent('cabinetTop-cabinetFront');
	},

	cutToChairEvent: function() {
		// body...
		var furniture_cutToChair = new THREE.Object3D();
		furniture_cutToChair = this.furnitures[0].getFurniture().clone();

	},

	addLegEvent: function() {
		// body...
		var furniture_addLeg = new THREE.Object3D();
		furniture_addLeg = this.furnitures[0].getFurniture().clone();

	},

	addDoorEvent: function() {
		// body...
		var furniture_addDoor = new THREE.Object3D();
		furniture_addDoor = this.furnitures[0].getFurniture().clone();
	},

	addRodEvent: function(){
		var furniture_addRod = new THREE.Object3D();
		furniture_addRod = this.furnitures[0].getFurniture().clone();
	},

	addSpiceRackEvent: function(){
		var furniture_addSpiceRack = new THREE.Object3D();
		furniture_addSpiceRack = this.furnitures[0].getFurniture().clone();
	},

	addDrawerEvent: function() {
		// body...
		var furniture_addDrawer = new THREE.Object3D();
		furniture_addDrawer = this.furnitures[0].getFurniture().clone();
	},

	changeHandlesEvent: function() {
		// body...
		var furniture_changeHandles = new THREE.Object3D();
		furniture_changeHandles = this.furnitures[0].getFurniture().clone();
	},

	removeDrawersEvent: function() {
		// body...
		var furniture_removeDrawers = new THREE.Object3D();
		furniture_removeDrawers = this.furnitures[0].getFurniture().clone();
	},

	execute: function(){
		if(this.checkHasTopFront(this.furnitures[0])){
			// cutToChairEvent();
			// addLegEvent();
			// addDoorEvent();
			// addRodEvent();
			// addSpiceRackEvent();
			// addDrawerEvent();
			// changeHandlesEvent();
			// removeDrawersEvent();
			console.log("123");
		}
		else{
			alert("Please mark cabinetTop and cabinetFront");
		}
		
	}
}

module.exports = Dresser_Add