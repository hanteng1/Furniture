//


function Chair_Add (main) {
 	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;  //midframe, seat, mixed


	

	//number of furnitures
	var count = 0;
 

}


Chair_Add.prototype = {

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

	//////////////////////////////////////////////////////////////////////////

	execute: function(){
		if (this.checkHasBack(this.furnitures[0])) {
			alert("add active.");
		}		
	}

}

module.exports = Chair_Add