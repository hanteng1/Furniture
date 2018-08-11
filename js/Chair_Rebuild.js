"use strict;"

const rebuildMakeSeat = require('./rebuildMakeSeat');

function Chair_Rebuild (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;

}


Chair_Rebuild.prototype = {


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
		this.SeatReplacement(this.furnitures[0]);
		
	},
	SeatReplacement: function(furniture){
		$('#rebuild').show();
		var group = furniture.getFurniture();
		var seat = furniture.getComponentByName('seat');
		var SeatSize = furniture.getComponentSize('seat');
		var SeatPosi = furniture.getComponentCenterPosition('seat');
		var saveposi = new THREE.Vector3(0,0,0);
		//save pisition
		saveposi.x = SeatPosi.x;
		saveposi.y = SeatPosi.y;
		saveposi.z = SeatPosi.z;

		var mode = "NormalSeat"
		var texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
		var main = this;
		main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
		SeatPosi.x = saveposi.x;
		SeatPosi.y = saveposi.y;
		SeatPosi.z = saveposi.z;

		$( ".item.ui.image.label.1" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				SeatPosi.x = saveposi.x;
				SeatPosi.y = saveposi.y;
				SeatPosi.z = saveposi.z;
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
			console.log(SeatPosi);
		});
		$( ".item.ui.image.label.2" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				SeatPosi.x = saveposi.x;
				SeatPosi.y = saveposi.y;
				SeatPosi.z = saveposi.z;
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.3" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				SeatPosi.x = saveposi.x;
				SeatPosi.y = saveposi.y;
				SeatPosi.z = saveposi.z;
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material3.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.4" ).click(function() {
			//change seat
			if (mode == "ThinBoard"){
				mode = "NormalSeat";
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				SeatPosi.x = saveposi.x;
				SeatPosi.y = saveposi.y;
				SeatPosi.z = saveposi.z;
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material4.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".align.justify.icon.1" ).click(function() {
			//change seat
			if (mode == "NormalSeat"){
				mode = "ThinBoard";
				main.changeseatmodel(furniture,SeatSize,SeatPosi, texture, mode);
				SeatPosi.x = saveposi.x;
				SeatPosi.y = saveposi.y;
				SeatPosi.z = saveposi.z;
			}
			//change material function
			var seat = furniture.getComponentByName('seat');
			texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
			console.log(SeatPosi);
			
		});

	},

	changeseatmodel: function(furniture,NewSeatSize,NewSeatPosi, texture, mode){
		//get the furniture
		var group = furniture.getFurniture();
		var seat = furniture.getComponentByName('seat');
		group.remove(seat);

		geometry = rebuildMakeSeat( NewSeatSize.x , NewSeatSize.y , NewSeatSize.z , mode);
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewSeat = new THREE.Mesh( geometry, newmaterial );
		NewSeat.name = 'seat';

		var inverseMatrix = new THREE.Matrix4();
		inverseMatrix.getInverse(group.matrixWorld, true);
		NewSeat.applyMatrix(inverseMatrix);
		
		group.worldToLocal(NewSeatPosi);
		NewSeat.position.set(NewSeatPosi.x - NewSeatSize.x/2, NewSeatPosi.y + NewSeatSize.z/2, NewSeatPosi.z );
		group.add(NewSeat);

	}


}
module.exports = Chair_Rebuild
