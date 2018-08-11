"use strict;"

const rebuildAddMat = require('./rebuildAddMat');

function Chair_Rebuild_AddMat  (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;

}

Chair_Rebuild_AddMat.prototype = {

	checkHasFrame: function(furniture) {
		
		return furniture.hasComponent('midframe');
	},


	checkHasSeat: function(furniture) {
		
		return furniture.hasComponent('seat');
	},

	checkHasBack: function(furniture) {
		
		return furniture.hasComponent('back');
	},

	getFrameHeight2Floor: function(furniture) {
		return furniture.getComponentHeight2Floor('midframe');
	},

	getSeatHeight2Floor: function(furniture) {
		return furniture.getComponentHeight2Floor('seat');
	},

	checkLabeledComponents: function(furnitures) {

		count = furnitures.length;
		//console.log(`number of chairs: ${count}`);

		//determine reference type
		var hasFrameCount = 0;
		var hasSeatCount = 0;
		for(var i = 0; i < count; i++)
		{
			if(this.checkHasFrame(furnitures[i])) hasFrameCount++;
			if(this.checkHasSeat(furnitures[i])) hasSeatCount++;	
		}

		if(hasFrameCount == count) {
			this.reference = 'midframe';

		}else if(hasSeatCount == count) {
			this.reference = 'seat';
		}else {
			//don't handle for now
			console.log("frame count or seat count not matched");
		}


		//todo: check the height and see whether they are the same
		if(this.reference == 'midframe') {
			//check the height

		}

	},
	execute: function(){
		var HasSeat = this.checkHasSeat(this.furnitures[0]);
		var HasBack = this.checkHasBack(this.furnitures[0]);
		
		if(HasSeat&&HasBack){
			this.AddMat(this.furnitures[0]);
		}
		
		
	},

	AddMat: function(furniture){


		var group = furniture.getFurniture();

		var SeatSize = furniture.getComponentSize('seat');
		var SeatPosi = furniture.getComponentCenterPosition('seat');
		var BackSize = furniture.getComponentSize('back');
		var BackPosi = furniture.getComponentCenterPosition('back');
		
		var texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );

		this.ChangeModel(furniture,SeatSize,SeatPosi, texture,'seat');
		this.ChangeModel(furniture,BackSize,BackPosi, texture,'back');

	},

	ChangeModel: function( furniture, Size, Posi, texture, name){
		//get the furniture
		var group = furniture.getFurniture();
		var obj = furniture.getComponentByName(name);
		group.remove(obj);

		geometry = rebuildAddMat( Size.x , Size.y , Size.z);
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewObj = new THREE.Mesh( geometry, newmaterial );
		NewObj.name = name;

		var inverseMatrix = new THREE.Matrix4();
		inverseMatrix.getInverse(group.matrixWorld, true);
		NewObj.applyMatrix(inverseMatrix);
		
		group.worldToLocal(Posi);
		NewObj.position.set(Posi.x - Size.z/2, Posi.y - Size.x/2, Posi.z - Size.y/2 );
		group.add(NewObj);

	}



}
module.exports = Chair_Rebuild_AddMat