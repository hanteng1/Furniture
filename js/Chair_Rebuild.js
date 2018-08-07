//


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
		this.changeTexture(this.furnitures[0]);
		
	},
	changeTexture: function(furniture){
		$('.ui.compact.vertical.labeled.image.menu').show();
		//get the furniture
		var group = furniture.getFurniture();

		var seat = furniture.getComponentByName('seat');
		var NewSeatSize = furniture.getComponentSize('seat');
		var NewSeatPosi = furniture.getComponentCenterPosition('seat');
		
		group.remove(seat);
		
		var geometry = new THREE.BoxGeometry( NewSeatSize.x , NewSeatSize.y , NewSeatSize.z );		
		var texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
		var newmaterial = new THREE.MeshBasicMaterial( {map: texture} );
		var NewSeat = new THREE.Mesh( geometry, newmaterial );
		NewSeat.position.set(NewSeatPosi.x, NewSeatPosi.y, NewSeatPosi.z);
		newscene = this.main.scene;
		newscene.add( NewSeat );

		$( ".item.ui.image.label.1" ).click(function() {
			//change material function
			texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			NewSeat.material = newmaterial;
			
		});
		$( ".item.ui.image.label.2" ).click(function() {
			//change material function
			texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			NewSeat.material = newmaterial;
		});
		$( ".item.ui.image.label.3" ).click(function() {
			//change material function
			texture = new THREE.TextureLoader().load( 'images/material/material3.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			NewSeat.material = newmaterial;
		});
		$( ".item.ui.image.label.4" ).click(function() {
			//change material function
			texture = new THREE.TextureLoader().load( 'images/material/material4.jpg' );
			// immediately use the texture for material creation
			newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			NewSeat.material = newmaterial;
		});

	}



}
module.exports = Chair_Rebuild
