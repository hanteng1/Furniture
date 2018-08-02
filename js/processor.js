//this is to handle the new design approaches
//that without the need of cad operations

function Processor(main) {
	this.main = main;
	this.category = main.category;  //chair, cabinet, table
	this.furnitures = main.furnitures;
}

Processor.prototype = {

	//execute design for chairs
	executeDesign: function() {
		
		var scope = this;

		switch(scope.category){

			case "chair" :
				if(scope.furnitures.length == 0) {
			
					return;

				}else if(scope.furnitures.length == 1){
					//possible actions with one furniture


				}else if( scope.furnitures.length > 1) {
					//possible actions with many furnitures
					var chair_align = new Chair_Align(scope.main);
					chair_align.execute();

				}


				break;

			case "cabinent" :


				break;


			case "table" :

				break;


		};

	}



}
