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
		var seat = furniture.getComponentByName('seat');
		
		$( ".item.ui.image.label.1" ).click(function() {
			//change material function
			var texture = new THREE.TextureLoader().load( 'images/material/material1.jpg' );
			// immediately use the texture for material creation
			var newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.2" ).click(function() {
			//change material function
			var texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
			// immediately use the texture for material creation
			var newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.3" ).click(function() {
			//change material function
			var texture = new THREE.TextureLoader().load( 'images/material/material3.jpg' );
			// immediately use the texture for material creation
			var newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});
		$( ".item.ui.image.label.4" ).click(function() {
			//change material function
			var texture = new THREE.TextureLoader().load( 'images/material/material4.jpg' );
			// immediately use the texture for material creation
			var newmaterial = new THREE.MeshBasicMaterial( { map: texture } );
			seat.material = newmaterial;
		});

	}



}
