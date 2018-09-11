"use strict;"

//this function for adding function 
function Procedure_button(main, str){

	//creat button, set class
	var btn = document.createElement("button");
	btn.classList.add("ui", "circular","icon","button","procedure",
					  main.stepObject.length.toString());
	btn.setAttribute ('id', "ui circular icon button procedure " + 
					  main.stepObject.length.toString())
	//set button string
	var t = document.createTextNode(str);
	btn.appendChild(t);
	
    //add button to Web
    document.getElementById("Procedure_List").appendChild(btn);

    //record scene object
    RecordObjects(main);
    main.stepNumber += 1;

    //set the click action
    btn.addEventListener("click", function(){

    	//if is the last step, create the step button
	    if(main.lastStep == true){
	    	main.lastStep = false;
	    	Procedure_button(main, main.stepOperationName);
	    }

	    //console.log(btn.classList[5]);
	    buttonClicked(main, btn.classList[5]);
	    main.stepNumber = btn.classList[5];
	    main.stepOperationName = btn.firstChild.nodeValue;

	    //Initialise the model button
	    main.processor.executeDesign("MODEL_ALIGN", "initial");
	    main.processor.executeDesign("MODEL_PAINTING", "initial");
        main.processor.executeDesign("MODEL_WRAP", "initial");
        main.processor.executeDesign("MODEL_ROTATION", "initial");
        main.processor.executeDesign("MODEL_ADDBETWEEN", "initial");
	    //show the control buttons
	    if(btn.firstChild.nodeValue != 'Initial')
	    	$('#parameter_control_tool_' + btn.firstChild.nodeValue).show();	    

	});
	
}

function RecordObjects(main){
	var RecordArr = [];

	for(var i = main.scene.children.length - 1; i > -1; i -- ){ 
		var object =  main.scene.children[i];	
		if(object.isObject3D){
			if ( object instanceof THREE.Camera ) {
			} else if ( object instanceof THREE.PointLight ) {
			} else if ( object instanceof THREE.DirectionalLight ) {
			} else if ( object instanceof THREE.SpotLight ) {					
			} else if ( object instanceof THREE.HemisphereLight ) {
			} else if ( object instanceof THREE.AmbientLight ) {
			} else if ( object instanceof THREE.GridHelper ) {
			} else if ( object instanceof THREE.TransformControls ){
			} else if ( object instanceof AddAxis){
			} else if ( object instanceof THREE.BoxHelper){
			} else if ( object == main.house) {
			} else if ( object instanceof THREE.DirectionalLightHelper){
			} else if ( object instanceof THREE.HemisphereLightHelper){
			} else{
				//RecordArr.push(object.clone());
				var isFurniture = false;
				for(var j = 0; j < main.furnitures.length; j++){
					if(main.furnitures[j].getFurniture() == object){
						isFurniture = true;
						SaveFurniture(main.furnitures[j], RecordArr);
						break;
					}
				}
				if(isFurniture == false){
					RecordArr.push(object.clone());
				}

			}
		}
	}
	//record the object
	main.stepObject.push( RecordArr );
}

function buttonClicked(main, btn_num){
	clearScene(main);
	var sceneObjs = main.stepObject[btn_num];
	main.furnitures = [];
	
	//clear cards
	$('#cards').empty();
	
	for(var i=0; i < sceneObjs.length; i++){
		//try to add furniture to scene
		try {
		    var furniture = sceneObjs[i];
			var new_furnitureObj = new THREE.Object3D();
			new_furnitureObj.copy(furniture.getFurniture(), true);
			var new_furniture = new Furniture(new_furnitureObj);

			new_furniture.setCategory("straight_chair");
			new_furniture.setIndex(furniture.index);
			main.furnitures.push(new_furniture);

			main.scene.add(new_furniture.getFurniture());
			
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

		}
		catch(err) {//if it is not furniture, add to scene directly
		    main.scene.add(sceneObjs[i]);
		}
		
	}
}

function clearScene(main){
	for(var i = main.scene.children.length - 1; i > -1; i -- ){ 
		var object =  main.scene.children[i];	
		if(object.isObject3D){
			if ( object instanceof THREE.Camera ) {
			} else if ( object instanceof THREE.PointLight ) {
			} else if ( object instanceof THREE.DirectionalLight ) {
			} else if ( object instanceof THREE.SpotLight ) {					
			} else if ( object instanceof THREE.HemisphereLight ) {
			} else if ( object instanceof THREE.AmbientLight ) {
			} else if ( object instanceof THREE.GridHelper ) {
			} else if ( object instanceof THREE.TransformControls ){
			} else if ( object instanceof AddAxis){
			} else if ( object instanceof THREE.BoxHelper){
			} else if ( object == main.house) {
			} else if ( object instanceof THREE.DirectionalLightHelper){
			} else if ( object instanceof THREE.HemisphereLightHelper){
			} else{
				main.removeFromScene(object);
			}
		}
	}
}

function SaveFurniture( furniture , furnituresDataSet) {

	//var furniture = this.furnitures[i];
	var new_furnitureObj = new THREE.Object3D();
	new_furnitureObj.copy(furniture.getFurniture(), true);
	var new_furniture = new Furniture(new_furnitureObj);

	new_furniture.setCategory("straight_chair");
	new_furniture.setIndex(furniture.index);
	furnituresDataSet.push(new_furniture);

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

}

module.exports = Procedure_button