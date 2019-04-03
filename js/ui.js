"use strict;"

function Ui(main)
{

	this.main = main;

	Number.prototype.format = function (){
		return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	};


}


Ui.prototype = {
	init: function(){
		//example
		var exampleImage = document.getElementById("exampleImage");
		var exampleLink = document.getElementById("exampleLink");

		var scope = this;




		//select a category
		$('#category_chair').click(function() {
			//group function
			scope.main.category0 = "chair";
			$('#blocker').hide();
			$('#initial_category_window').hide();

			$('#minfo').html(scope.main.category0);

			$('#label_l_6').hide();
			$('#label_l_7').hide();
			$('#label_l_8').hide();
			$('#label_l_9').hide();
			$('#label_l_10').hide();
			$('#label_l_11').hide();

		});

		$('#category_cabinet').click(function() {
			//group function
			scope.main.category0 = "cabinet";
			$('#blocker').hide();
			$('#initial_category_window').hide();

			$('#minfo').html(scope.main.category0);

			$('#label_l_1').hide();
			$('#label_l_2').hide();
			$('#label_l_9').hide();
			$('#label_l_10').hide();
			$('#label_l_11').hide();

		});


		$('#category_table').click(function() {
			//group function
			scope.main.category0 = "table";
			$('#blocker').hide();
			$('#initial_category_window').hide();

			$('#minfo').html(scope.main.category0);

			$('#label_l_1').hide();
			$('#label_l_2').hide();
			$('#label_l_6').hide();
			$('#label_l_7').hide();
			$('#label_l_8').hide();
			$('#label_l_11').hide();

		});


		// $('#category_bed').click(function() {
		// 	//group function
		// 	scope.main.category0 = "bed";
		// 	$('#blocker').hide();
		// 	$('#initial_category_window').hide();

		// 	$('#minfo').html(scope.main.category0);

		// });

		$('#category_desk').click(function() {
			//group function
			scope.main.category0 = "desk";
			$('#blocker').hide();
			$('#initial_category_window').hide();

			$('#minfo').html(scope.main.category0);


			$('#label_l_1').hide();
			$('#label_l_2').hide();
			$('#label_l_6').hide();
			$('#label_l_7').hide();
			$('#label_l_8').hide();
			$('#label_l_9').hide();
			$('#label_l_10').hide();

		});


		$('#category_dresser').click(function() {
			//group function
			scope.main.category0 = "dresser";
			$('#blocker').hide();
			$('#initial_category_window').hide();

			$('#minfo').html(scope.main.category0);

			$('#label_l_1').hide();
			$('#label_l_2').hide();
			$('#label_l_8').hide();
			$('#label_l_9').hide();
			$('#label_l_10').hide();
			$('#label_l_11').hide();

		});



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
						//stand
						scope.assignLabel("cTop");
						break;
					case "l_7":
						//stand
						scope.assignLabel("cFront");
						break;
					case "l_8":
						//stand
						scope.assignLabel("cBroad");
						break;

					case "l_9":
						scope.assignLabel("tTop");
						break;

					case "l_10":
						scope.assignLabel("tLeg");
						break;

					case "l_11":
						scope.assignLabel("dTop");
						break;

					
				}
			}
		});
		

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

			scope.main.category = scope.main.category0;
			scope.main.applyDesign();

		});

		$('.ui.blue.submit.button.customdesign').click(function(){

			scope.main.category = "tool";
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
		


		//initial category window model selection
		$('#model_image_1').click(function(){
			//load model 1	
			scope.quickLoadFile();
		});

		$('#model_image_2').click(function(){
			//load model 2	
			scope.quickLoadFile();
		});

		$('#model_image_3').click(function(){
			//load model 3	
			scope.quickLoadFile();
		});



		//chair_align controller function
		this.designButtons();


		this.rangeSlider();

		//in the end, hide all the needed items
		$('#model_size_initialization').hide();
		$('#initial_category_window').hide();

		$('#label').hide();

		$('#parameter_control_chair_align').hide();
		$('#parameter_control_chair_rebuild').hide();
		$('#parameter_control_chair_add').hide();
		$('#parameter_control_cabinet_bed').hide();

		$('.operations.operation_chair_align').hide();
		$('.operations.operation_chair_add').hide();
		$('.operations.operation_chair_rebuild').hide();

		$('.operations.operation_dresser_add').hide();
		$('.operations.operation_dresser_add_two').hide();

		$('.operations.operation_cabinet_kallax_one').hide();
		$('.operations.operation_cabinet_kallax_two').hide();
		$('.ui.blue.submit.button.getsize').hide();
		$('.ui.red.submit.button.removesize').hide();
		$('.ui.blue.submit.button.getdis').hide();

		$('.operations.operation_table').hide();
		$('.operations.operation_table_two').hide();
		$('.operations.operation_desk').hide();

		$('.operations.operation_tool').hide();
		$('#parameter_control_tool_painting').hide();
		$('#parameter_control_tool_wrap').hide();
		$('#parameter_control_tool_rotation').hide();
		$('#parameter_control_tool_align').hide();

		$('#parameter_control_tool_add').hide();
		$('#parameter_control_tool_addbetween').hide();
		$('#parameter_control_tool_cut').hide();
		$('#AddRodInput').hide();


		// example
		$('.example').hide();


		$('#initial_category_window').slideDown(500);
	},


	//operation click functions 
	designButtons: function() {
		
		var scope = this.main;

		//--------------------------Suggestive Design---------------------------------
		//chair_align_vertical
		$( "#operation_chair_align_vertical" ).click(function() {
			scope.processor.executeDesign("CHAIR_ALIGN", "vertical");
			$('#parameter_control_chair_align').show();

			// example
			exampleImage.src = "images/example/CHAIR_ALIGN_vertical.png";
			exampleLink.href = "https://read01.com/zh-tw/eL887P.html#.XCRznc8zZBx";
			exampleLink.text = "Bench";
			$('.example').show();
		});

		//chair_align_horizontal
		$( "#operation_chair_align_horizontal" ).click(function() {
			scope.processor.executeDesign("CHAIR_ALIGN", "horizontal");

			// example
			exampleImage.src = "images/example/CHAIR_ALIGN_horizontal.png";
			exampleLink.href = "https://read01.com/zh-tw/eL887P.html#.XCRznc8zZBx";
			exampleLink.text = "Bench";
			$('.example').show();
		});

		//chair_align_flip
		$( "#operation_chair_align_flip" ).click(function() {
			scope.processor.executeDesign("CHAIR_ALIGN", "flip");

			// example
			exampleImage.src = "images/example/CHAIR_ALIGN_flip.png";
			exampleLink.href = "https://www.pinterest.com/pin/56646907794456800/";
			exampleLink.text = "Bench";
			$('.example').show();
		});


		//chair_aling_connect_1
		$( "#operation_chair_align_connect_1" ).click(function() {
			scope.processor.executeDesign("CHAIR_ALIGN", "connect1");
		});


		//chair_aling_connect_2
		$( "#operation_chair_align_connect_2" ).click(function() {
			scope.processor.executeDesign("CHAIR_ALIGN", "connect2");
		});


		//chair_add_plate
		$('#operation_chair_add_plate').click(function() {
			scope.processor.executeDesign("CHAIR_ADD", "plate");
			$('#parameter_control_chair_add').show();

			// example
			exampleImage.src = "images/example/CHAIR_ADD_plate.png";
			exampleLink.href = "https://www.pinterest.com/pin/281543705299914/";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		//chair_add_hook
		$('#operation_chair_add_hook').click(function() {
			scope.processor.executeDesign("CHAIR_ADD", "hook");

			// example
			exampleImage.src = "images/example/CHAIR_ADD_hook.png";
			exampleLink.href = "https://read01.com/zh-tw/G4o6aL.html#.XCR4Cc8zZBx";
			exampleLink.text = "Hook";
			$('.example').show();
		});

		//chair_add_flip
		$('#operation_chair_add_hang').click(function() {
			scope.processor.executeDesign("CHAIR_ADD", "hang");

			// example
			exampleImage.src = "images/example/CHAIR_ADD_hang.png";
			exampleLink.href = "https://www.pinterest.com/pin/566186984387890581/";
			exampleLink.text = "Swing";
			$('.example').show();
		});

		//chair_rebuild_seat
		$('#operation_chair_rebuild_seat').click(function() {
			scope.processor.executeDesign("CHAIR_REBUILD", "seat");
			$('#parameter_control_chair_rebuild').show();

			// example
			exampleImage.src = "images/example/CHAIR_REBUILD_seat.png";
			exampleLink.href = "http://www.architectureartdesigns.com/15-most-amazing-before-and-after-chair-makeover-ideas/amp/";
			exampleLink.text = "Chair";
			$('.example').show();
		});

		//chair_rebuild_back
		$('#operation_chair_rebuild_back').click(function() {
			scope.processor.executeDesign("CHAIR_REBUILD", "backrest");

			// example
			exampleImage.src = "images/example/CHAIR_REBUILD_backrest.png";
			exampleLink.href = "http://www.architectureartdesigns.com/15-most-amazing-before-and-after-chair-makeover-ideas/amp/";
			exampleLink.text = "Chair";
			$('.example').show();
		});

		//chair_rebuild_leg
		$('#operation_chair_rebuild_leg').click(function() {
			scope.processor.executeDesign("CHAIR_REBUILD", "leg");

			// example
			exampleImage.src = "images/example/CHAIR_REBUILD_leg.png";
			exampleLink.href = "https://www.pinterest.com/pin/83035186854913776/";
			exampleLink.text = "Office Chair";
			$('.example').show();
		});

		//dresser
		$('#operation_dresser_add_cut_chair').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "cut_chair");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_cutChair.png";
			exampleLink.href = "http://www.foliver.com/diy/40-awesome-makeovers-clever-ways-with-tutorials-to-repurpose-old-furniture/";
			exampleLink.text = "Chair";
			$('.example').show();
		});
		$('#operation_dresser_add_add_door').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_door");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_addDoor.png";
			exampleLink.href = "https://www.ikeahackers.net/2016/07/nornas-cd-lp-chest.html";
			exampleLink.text = "Dresser";
			$('.example').show();
		});
		$('#operation_dresser_add_add_leg').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_leg");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_addLeg.png";
			exampleLink.href = "https://www.ikeahackers.net/2016/12/ivar-grown.html";
			exampleLink.text = "Dresser";
			$('.example').show();
		});
		$('#operation_dresser_add_add_rod').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_rod");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_addRod1.png";
			exampleLink.href = "https://www.ikeahackers.net/2016/12/ivar-grown.html";
			exampleLink.text = "Dresser";
			$('.example').show();
		});
		$('#operation_dresser_add_add_rod_two').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_rod");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_addRod2.png";
			exampleLink.href = "https://www.ikeahackers.net/2013/10/twin-rasts-in-the-nursery.html";
			exampleLink.text = "Wardrobe";
			$('.example').show();
		});
		$('#operation_dresser_add_add_spice_rack').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_spice_rack");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_addSpiceRack.png";
			exampleLink.href = "http://www.foliver.com/diy/40-awesome-makeovers-clever-ways-with-tutorials-to-repurpose-old-furniture/6/";
			exampleLink.text = "Wardrobe";
			$('.example').show();
		});
		$('#operation_dresser_add_add_drawer').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "add_drawer");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_addDrawer.png";
			exampleLink.href = "https://www.pinterest.com/pin/397372367099234865/";
			exampleLink.text = "Dresser";
			$('.example').show();
		});
		$('#operation_dresser_add_remove_drawers').click(function() {
			scope.processor.executeDesign("DRESSER_ADD", "remove_drawers");

			// example
			exampleImage.src = "images/example/DRESSER_ADD_removeDrawers.png";
			exampleLink.href = "http://www.foliver.com/diy/40-awesome-makeovers-clever-ways-with-tutorials-to-repurpose-old-furniture/28/";
			exampleLink.text = "Dresser";
			$('.example').show();
		});

		//cabinet_kallax_chair
		$('#operation_cabinet_kallax_chair').click(function() {
			scope.processor.executeDesign("CABINET_LALLAX", "chair");

			// example
			exampleImage.src = "images/example/CABINET_KALLAX_chiar.png";
			exampleLink.href = "https://lesbricolesdemel.wordpress.com/2016/03/20/inspiration-1-ikea-hack-la-gamme-kallax/";
			exampleLink.text = "Chair";
			$('.example').show();
		});

		//cabinet_kallax_bed
		$('#operation_cabinet_kallax_bed').click(function() {
			scope.processor.executeDesign("CABINET_LALLAX", "bed");
			$('#parameter_control_cabinet_bed').show();

			// example
			exampleImage.src = "images/example/CABINET_KALLAX_bed.png";
			exampleLink.href = "https://www.pinterest.com/pin/596234438136893984/";
			exampleLink.text = "Bed";
			$('.example').show();
		});

		

		//cabinet_kallax_table
		$('#operation_cabinet_kallax_table').click(function() {
			scope.processor.executeDesign("CABINET_LALLAX", "table");

			// example
			exampleImage.src = "images/example/CABINET_KALLAX_table.png";
			exampleLink.href = "https://www.pinterest.com/pin/453385887470070464/";
			exampleLink.text = "Table";
			$('.example').show();
		});


		//table
		$('#operation_table_stack').click(function() {
			scope.processor.executeDesign("TABLE", "stack");

			// example
			exampleImage.src = "images/example/TABLE_stack.png";
			exampleLink.href = "https://www.ikeahackers.net/2015/11/kitchen-tables-converted-canine-condo.html";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		$('#operation_table_flipStack').click(function() {
			scope.processor.executeDesign("TABLE", "flipStack");

			// example
			exampleImage.src = "images/example/TABLE_flipStack.png";
			exampleLink.href = "https://www.ikeahackers.net/2016/08/complementary-small-lack-entertainment-centre-lack-coffee-table.html";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		$('#operation_table_addWheel').click(function() {
			scope.processor.executeDesign("TABLE", "addWheel");

			// example
			exampleImage.src = "images/example/TABLE_addWheel.png";
			exampleLink.href = "https://www.ikeahackers.net/2014/11/norden-tables-turn-into-rolling-kitchen-island.html";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		$('#operation_table_addBoardOnTabletop').click(function() {
			scope.processor.executeDesign("TABLE", "addBoardOnTabletop");

			// example
			exampleImage.src = "images/example/TABLE_addBoardOnTabletop.png";
			exampleLink.href = "https://www.ikeahackers.net/2016/04/norden-concealed-puzzle-table.html";
			exampleLink.text = "Table";
			$('.example').show();
		});

		$('#operation_table_addBoard').click(function() {
			scope.processor.executeDesign("TABLE", "addBoard");

			// example
			exampleImage.src = "images/example/TABLE_addBoard.png";
			exampleLink.href = "https://www.ikeahackers.net/2014/12/coastal-ikea-kitchen-island-from-bjorkudden-table.html";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		$('#operation_table_addDrawer').click(function() {
			scope.processor.executeDesign("TABLE", "addDrawer");

			// example
			exampleImage.src = "images/example/TABLE_addDrawer.png";
			exampleLink.href = "https://www.ikeahackers.net/2015/10/lack-table-with-lego-storage-drawers.html";
			exampleLink.text = "Desk";
			$('.example').show();
		});

		$('#operation_table_addRod').click(function() {
			scope.processor.executeDesign("TABLE", "addRod");

			// example
			exampleImage.src = "images/example/TABLE_addRod.png";
			exampleLink.href = "https://www.ikeahackers.net/2012/01/latt-table-equipped.html";
			exampleLink.text = "Table";
			$('.example').show();
		});

		$('#operation_table_addSeat').click(function() {
			scope.processor.executeDesign("TABLE", "addSeat");

			// example
			exampleImage.src = "images/example/TABLE_addSeat.png";
			exampleLink.href = "https://www.ikeahackers.net/2014/12/hemnes-coffee-table-turned-ottoman.html";
			exampleLink.text = "Chair";
			$('.example').show();
		});

		$('#operation_table_addDoorBoard').click(function() {
			scope.processor.executeDesign("TABLE", "addDoorBoard");

			// example
			exampleImage.src = "images/example/TABLE_addDoorBoard.png";
			exampleLink.href = "https://www.pinterest.com/pin/434386326543745294/";
			exampleLink.text = "Table";
			$('.example').show();
		});

		//desk
		$('#operation_desk_add_beside_board').click(function() {
			scope.processor.executeDesign("DESK", "addBesideBoard");

			// example
			exampleImage.src = "images/example/DESK_addBesideBoard.png";
			exampleLink.href = "https://www.pinterest.com/pin/Ac4hkJyzj0ISaeN8xDGwSCOVbudDAWn3bO3ZEZkd7aBbfXLXYk6P04Q/";
			exampleLink.text = "Desk";
			$('.example').show();
		});

		$('#operation_desk_add_top_board').click(function() {
			scope.processor.executeDesign("DESK", "addTopBoard");

			// example
			exampleImage.src = "images/example/DESK_addTopBoard.png";
			exampleLink.href = "https://www.ikeahackers.net/2015/10/affordable-dressing-table-makeup-vanity.html";
			exampleLink.text = "Desk";
			$('.example').show();
		});

		$('#operation_desk_add_bottom_board').click(function() {
			scope.processor.executeDesign("DESK", "addBottomBoard");

			// example
			exampleImage.src = "images/example/DESK_addBottomBoard.png";
			exampleLink.href = "https://www.pinterest.com/pin/112097478194528944/";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		$('#operation_desk_add_inside_board').click(function() {
			scope.processor.executeDesign("DESK", "addInsideBoard");

			// example
			exampleImage.src = "images/example/DESK_addInsideBoard.png";
			exampleLink.href = "http://www.chicaandjo.com/turn-a-sewing-table-into-a-bar-cart/";
			exampleLink.text = "Shelf";
			$('.example').show();
		});

		$('#operation_desk_add_wheel').click(function() {
			scope.processor.executeDesign("DESK", "addWheel");

			// example
			exampleImage.src = "images/example/DESK_addWheel.png";
			exampleLink.href = "https://www.pinterest.com/pin/288863763581244731/";
			exampleLink.text = "Shelf";
			$('.example').show();
		});


		//--------------------------Customized Design---------------------------------
		//model painting
		$('#operation_Painting').click(function() {
			scope.processor.executeDesign("MODEL_PAINTING", "painting");

			// example
			$('.example').hide();
		});

		//model wrap
		$('#operation_Wrap').click(function() {
			scope.processor.executeDesign("MODEL_WRAP", "wrap");

			// example
			$('.example').hide();
		});

		//model rotation
		$('#operation_Rotation').click(function() {
			scope.processor.executeDesign("MODEL_ROTATION", "rotation");

			// example
			$('.example').hide();
		});

		//model align
		$('#operation_Align').click(function() {
			scope.processor.executeDesign("MODEL_ALIGN", "align");

			// example
			$('.example').hide();
		});

		//add
		$('#operation_Add').click(function() {
			scope.processor.executeDesign("MODEL_ADD", "add");

			// example
			$('.example').hide();
		});

		//addbetween
		$('#operation_AddBetween').click(function() {
			scope.processor.executeDesign("MODEL_ADDBETWEEN", "addbetween");

			// example
			$('.example').hide();
		});
		$('.ui.button.InputRod.minus').click(function() {
			var num = parseFloat(document.getElementById('InputRodRadius').value);
			num-=0.1;
			document.getElementById('InputRodRadius').value = num.toFixed(1).toString();

			// example
			$('.example').hide();
		});
		$('.ui.button.InputRod.plus').click(function() {
			var num = parseFloat(document.getElementById('InputRodRadius').value);
			num+=0.1;
			document.getElementById('InputRodRadius').value = num.toFixed(1).toString();

			// example
			$('.example').hide();
		});

		//cut
		$('#operation_Cut').click(function(){
			scope.processor.executeDesign("MODEL_CUT", "cut");

			// example
			$('.example').hide();
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

			console.log(fileInput.files[ 0 ]);

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
					//scope.main.preAddObject(object);  //this.main becomes undefined
					scope.main.addObject(object);
				}, false );
				reader.readAsText( file );

			break;


			case 'dae':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					var loader = new THREE.ColladaLoader();
					var collada = loader.parse( contents );

					collada.scene.name = filename;
					//scope.main.preAddObject(collada.scene ); 
					scope.main.addObject(collada.scene);

					//test
					//scope.main.scene.add(collada.scene);


				}, false );
				reader.readAsText( file );
			break;

			case 'glb':
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;

					//console.log(contents);

					var loader = new THREE.GLTFLoader();
					var gltf = loader.parse(contents);
					//scope.main.preAddObject(gltf.scene ); 
					scope.main.addObject(gltf.scene);
				}, false );

				reader.readAsText( file );

			break;
		}
	},



	quickLoadFile: function(path)
	{
		var elf;
		var scope = this;

		var loadingManager = new THREE.LoadingManager( function () {
			scope.main.addObject(elf);
		} );

		var loader = new THREE.ColladaLoader( loadingManager );
		loader.load( './models/chair/chair6.dae', function ( collada ) {
			elf = collada.scene;
		});

	},

	assignLabel: function(label){
		
		this.main.assignLabel(label);

	}
}







