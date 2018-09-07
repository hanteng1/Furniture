"use strict;"

function Ui(main)
{

	this.main = main;

	Number.prototype.format = function (){
		return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	};



	//zhuen's block



	//end of zhuen's block



	//weixiang's bloack



	//end of weixiang's block




	//trif's block




	//end of trif's block

}


Ui.prototype = {
	init: function(){

		var scope = this;

		$('.ui.dropdown').dropdown({
			action: 'hide',
			onChange: function(value, text, $selectedItem) {
				switch(value)
				{
					//file menu commnads
					case "f_1":
						//new
						break;
					case "f_2":
						//open
						scope.fileLoader();
						break;
					case "f_3":
						//save
						break;
					//label menu commands
					case  "l_1":
						//back
						scope.assignLabel("back");
						break;
					case "l_2":
						//seat
						scope.assignLabel("seat");
						break;
					case "l_3":
						//midframe
						scope.assignLabel("midframe");
						break;
					case "l_4":
						//stand
						scope.assignLabel("stand");
						break;
					case "l_6":
						scope.assignLabel("cabinetTop");
						break;
					case "l_7":
						scope.assignLabel("cabinetFront");
						break;
					case "l_8":
						scope.assignLabel("cabinetBroad");
						break;
					case "l_9":
						scope.assignLabel("tabletop");
						break;
					case "l_10":
						scope.assignLabel("tableLeg");
						break;
					case "l_11":
						scope.assignLabel("desktop");
						break;
					case "l_12":
						scope.assignLabel("deskDrawer");
						break;
					
				}
			}
		});
		
		//weixiang's bloack


		//end of weixiang's block

		$( ".item.m_group" ).click(function() {
			//group function
			scope.main.mergeObjs();
		});

		$( ".item.m_delete" ).click(function() {
			//group function
			scope.main.DeleteObj();
		});


		//enable house environment
		$('.ui.toggle.checkbox.house').checkbox({

			onChecked: function() {
      			//enable house environment
      			scope.main.enableHouseEnvironment();

    		},
    		onUnchecked: function() {
      			//disable house environment
      			scope.main.disableHouseEnvironment();
    		}
		});

		$('.ui.toggle.checkbox.house').checkbox("check");

		//reset the scene
		$('.ui.blue.submit.button.reset').click(function(){
			scope.main.resetFurnitures();
		});

		//duplicate a model
		$('.ui.blue.submit.button.duplicate').click(function(){
			
			if(scope.main.furniture == null || scope.main.furniture == undefined){
				return;
			}

			var furniture = scope.main.furniture;
			var new_furnitureObj = new THREE.Object3D();
			new_furnitureObj.copy(furniture.getFurniture(), true);
			var new_furniture = new Furniture(new_furnitureObj);

			new_furniture.setCategory("straight_chair");
			new_furniture.setIndex(scope.main.furnitures.length + 1);
			scope.main.furnitures.push(new_furniture);

			scope.main.scene.add(scope.main.furnitures[scope.main.furnitures.length - 1].getFurniture());

			//update the menu interface
			new_furniture.addCard();

			//copy the state
			new_furniture.updatePosition(furniture.position);
			new_furniture.updateDirection();
			new_furniture.updateQuaternion(furniture.quaternion);

			//copy the components and labeled state
			new_furniture.updateListedComponents(furniture.listedComponents);
			new_furniture.updateLabeledComponents(furniture.labeledComponents);

			//copy the already labeled normal axis
			//Object.assign(new_furniture.normalAxises, furniture.normalAxises);
			for (let key in furniture.normalAxises) {
				new_furniture.normalAxises[key] = new THREE.Vector3();
				new_furniture.normalAxises[key].copy(furniture.normalAxises[key]);
			}

			//make an offset for the position
			var size = new_furniture.getSize();
			var position = new_furniture.getPosition();
			var new_position = new THREE.Vector3();
			new_position.copy(position);
			new_position.add(new THREE.Vector3(2 * size.x, 0, (-2) * size.z))

			new_furniture.moveToPosition(new_position);

		});

		$('.ui.blue.submit.button.newdesign').click(function(){

			scope.main.applyDesign();

		});
		$('.ui.blue.submit.button.getsize').click(function(){

			scope.main.LabelSize();

		});
		$('.ui.red.submit.button.removesize').click(function(){

			scope.main.RemoveSizeLabel();
			
		});
		$('.ui.blue.submit.button.getdis').click(function(){

			scope.main.GetDistance();
			
		});
		

		//chair_align controller function
		this.designButtons();


		this.rangeSlider();


		


		//in the end, hide all the needed items
		$('#model_size_initialization').hide();

		$('#label').hide();

		$('#parameter_control_chair_align').hide();
		$('#parameter_control_chair_rebuild').hide();
		$('#parameter_control_chair_add').hide();
		$('#parameter_control_cabinet_bed').hide();

		$('.operations.operation_chair_align').hide();
		$('.operations.operation_chair_add').hide();
		$('.operations.operation_chair_rebuild').hide();

		$('.operations.operation_dresser_add').hide();

		$('.operations.operation_cabinet_kallax_one').hide();
		$('.operations.operation_cabinet_kallax_two').hide();

		$('.operations.operation_table').hide();
		$('.operations.operation_desk').hide();

		
		$('.ui.blue.submit.button.getsize').hide();
		$('.ui.red.submit.button.removesize').hide();
		$('.ui.blue.submit.button.getdis').hide();
		$('.operations.operation_tool').hide();
		$('#parameter_control_tool_painting').hide();
		$('#parameter_control_tool_wrap').hide();
		$('#parameter_control_tool_rotation').hide();
		$('#parameter_control_tool_align').hide();
		

	},


	//operation click functions 
	designButtons: function() {
		
		var scope = this.main;

		//chair_align_vertical
		$( "#operation_chair_align_vertical" ).click(function() {
			console.log("chair_align_vertical");
			scope.processor.executeDesign("CHAIR_ALIGN", "vertical");

			$('#parameter_control_chair_align').show();
		});

		//chair_align_horizontal
		$( "#operation_chair_align_horizontal" ).click(function() {
			console.log("chair_align_horizontal");
			scope.processor.executeDesign("CHAIR_ALIGN", "horizontal");
			//no parameter for now
		});

		//chair_align_flip
		$( "#operation_chair_align_flip" ).click(function() {

			// //wei hsiang start
			// scope.processor.executeDesign("CHAIR_REBUILD", "back");
			// //wei hsiang end

			console.log("chair_align_flip");
			scope.processor.executeDesign("CHAIR_ALIGN", "flip");

		});

		//chair_add_plate
		$('#operation_chair_add_plate').click(function() {
			scope.processor.executeDesign("CHAIR_ADD", "plate");

			$('#parameter_control_chair_add').show();
		});

		//chair_add_hook
		$('#operation_chair_add_hook').click(function() {
			scope.processor.executeDesign("CHAIR_ADD", "hook");
		});

		//chair_add_flip
		$('#operation_chair_add_hang').click(function() {
			scope.processor.executeDesign("CHAIR_ADD", "hang");
		});

		//chair_rebuild_seat
		$('#operation_chair_rebuild_seat').click(function() {
			console.log("chair_rebuild_seat");
			scope.processor.executeDesign("CHAIR_REBUILD", "seat");
			$('#parameter_control_chair_rebuild').show();
		});

		//chair_rebuild_back
		$('#operation_chair_rebuild_back').click(function() {
			console.log("chair_rebuild_back_rest");
			scope.processor.executeDesign("CHAIR_REBUILD", "backrest");
		});

		//chair_rebuild_leg
		$('#operation_chair_rebuild_leg').click(function() {
			scope.processor.executeDesign("CHAIR_REBUILD", "leg");
		});




		//dresser
		$('#operation_dresser_add_cut_chair').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "cut_chair");
		});
		$('#operation_dresser_add_door').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_door");
		});
		$('#operation_dresser_add_leg').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_leg");
		});
		$('#operation_dresser_add_rod').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_rod");
		});
		$('#operation_dresser_add_spice_rack').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_spice_rack");
		});
		$('#operation_dresser_add_drawer').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_drawer");
		});
		$('#operation_dresser_remove_drawers').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "remove_drawers");
		});


		//cabinet_kallax_chair
		$('#operation_cabinet_kallax_chair').click(function() {
			scope.processor.executeDesign("CABINET_LALLAX", "chair");
		});

		//cabinet_kallax_bed
		$('#operation_cabinet_kallax_bed').click(function() {
			scope.processor.executeDesign("CABINET_LALLAX", "bed");
			$('#parameter_control_cabinet_bed').show();
		});

		//cabinet_kallax_table
		$('#operation_cabinet_kallax_table').click(function() {
			scope.processor.executeDesign("CABINET_LALLAX", "table");

		});



		//table
		$('#operation_table_stack').click(function() {
			scope.processor.executeDesign("TABLE", "stack");
		});

		$('#operation_table_flipStack').click(function() {
			scope.processor.executeDesign("TABLE", "flipStack");
		});

		$('#operation_table_addWheel').click(function() {
			scope.processor.executeDesign("TABLE", "addWheel");
		});

		$('#operation_table_addBoardOnTabletop').click(function() {
			scope.processor.executeDesign("TABLE", "addBoardOnTabletop");
		});

		$('#operation_table_addBoard').click(function() {
			scope.processor.executeDesign("TABLE", "addBoard");
		});

		$('#operation_table_addDrawer').click(function() {
			scope.processor.executeDesign("TABLE", "addDrawer");
		});

		$('#operation_table_addRod').click(function() {
			scope.processor.executeDesign("TABLE", "addRod");
		});

		$('#operation_table_addSeat').click(function() {
			scope.processor.executeDesign("TABLE", "addSeat");
		});

		$('#operation_table_addDoorBoard').click(function() {
			scope.processor.executeDesign("TABLE", "addDoorBoard");
		});

		//desk
		$('#operation_desk_add_board').click(function() {
			scope.processor.executeDesign("DESK", "addBoard");
		});

		$('#operation_Painting').click(function() {
			scope.processor.executeDesign("MODEL_PAINTING", "painting");

		});
		$('#operation_Wrap').click(function() {
			scope.processor.executeDesign("MODEL_WRAP", "wrap");

		});
		$('#operation_Rotation').click(function() {
			scope.processor.executeDesign("MODEL_ROTATION", "rotation");

		});
		$('#operation_Align').click(function() {
			scope.processor.executeDesign("MODEL_ALIGN", "align");

		});



	},


	//range slider functions
	rangeSlider: function() {
		var scope = this;

		var slider = $('.range-slider'),
		range = $('.range-slider__range'),
		value = $('.range-slider__value');
    	
    	slider.each(function(){

    		var slider_id = this.id;

    		if(slider_id !== undefined) {

    			//initialize the value
    			value.each(function(){
	    			var value = $(this).prev().attr('value');
	    			$(this).html(value);
		    	});

    			//attach an event callback function
    			$(this).children(".range-slider__range").on('input', function(){
					$(this).next(value).html(this.value);

					//add functions here
					//direct to the function in main
					scope.main.processor.changeParameterValue(slider_id, this.id, this.value);

				});

				// range.on('input', function(){
				// 	$(this).next(value).html(this.value);
				// });


    		}else {
    			console.log("there is slider without id");
    		}

		});
	},


	fileLoader: function(){
		
		var scope = this;

		var form = document.createElement( 'form' );
		form.style.display = 'none';
		document.body.appendChild( form );

		var fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.addEventListener( 'change', function ( event ) {

			scope.loadFile( fileInput.files[ 0 ] );
			form.reset();

		} );
		form.appendChild( fileInput );
		fileInput.click();
	},

	loadFile: function(file)
	{
		var scope = this;

		var filename = file.name;
		var extension = filename.split( '.' ).pop().toLowerCase();

		var reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			console.log( 'Loading', filename, size, progress );

		} );

		switch(extension){
			case 'obj':
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;
					//add to the scene
					scope.main.preAddObject(object);  //this.main becomes undefined
				}, false );
				reader.readAsText( file );

			break;


			case 'dae':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.ColladaLoader();
					var collada = loader.parse( contents );

					collada.scene.name = filename;
					scope.main.preAddObject(collada.scene ); 

				}, false );
				reader.readAsText( file );
			break;


			case 'glb':
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					//console.log(contents);

					var loader = new THREE.GLTFLoader();
					var gltf = loader.parse(contents);
					scope.main.preAddObject(gltf.scene ); 

				}, false );

				reader.readAsText( file );

			break;
		}
	},

	assignLabel: function(label){
		
		this.main.assignLabel(label);

	}
}







