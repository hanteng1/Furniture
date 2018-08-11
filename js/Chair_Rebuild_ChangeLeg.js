"use strict;"


function Chair_Rebuild_ChangeLeg (main) {

	this.main = main;
	this.furnitures = main.furnitures;

	this.reference = null;

}

Chair_Rebuild_ChangeLeg.prototype = {

	checkHasFrame: function(furniture) {
		
		return furniture.hasComponent('midframe');
	},


	checkHasSeat: function(furniture) {
		
		return furniture.hasComponent('seat');
	},

	checkHasBack: function(furniture) {
		
		return furniture.hasComponent('back');
	},

	checkHasLeg: function(furniture) {
		
		return furniture.hasComponent('stand');
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
		this.ChangeLeg(this.furnitures[0]);
		
	},
	ChangeLeg: function(furniture){
		//get the furniture group
		var group = furniture.getFurniture();
		//get seat size
		var SeatSize = furniture.getComponentSize('seat');
		var SeatPosi = furniture.getComponentCenterPosition('seat');
		/*
		//delete leg
		while(this.checkHasLeg(furniture)){
			//get Leg object
			var Leg = furniture.getComponentByName('stand');
			group.remove(Leg);
		}
		*/
		this.remove(furniture,'stand');
		
		
		

	},
	remove: function(group, name){
		for (var i = group.children.length - 1; i >= 0 ; i--) {				
			var str = group.children[i].name;
			if (str == name) {
				group.remove(group.children[i]);
			}	
		}
	},

}

module.exports = Chair_Rebuild_ChangeLeg
