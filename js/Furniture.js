"use strict;"
function Furniture(furniture) {
	
	this.furniture = furniture; //a group type object
	//this.objects = []; //a array type of the components
	this.category = null;
	this.index = null;
	//world positon transformation info
	this.position = new THREE.Vector3();
	//local rotation transformation info
	this.quaternion = new THREE.Quaternion();
	//world diretion, direction of object's positive z
	this.direction = new THREE.Vector3();

	this.positionInfo = document.createElement('div');
	this.directionInfo = document.createElement('div');
	this.componentLabels = document.createElement('div');

	// this.setObjects = function(objects) {
	// 	this.objects = objects;
	// }

	//expected normal axis
	//need to complete
	this.normalAxises = {
		//for chairs
		seat: new THREE.Vector3(0, 1, 0),
		back: new THREE.Vector3(0, 0, 1),
		midframe: new THREE.Vector3(0, 0, 1)


		//for cabinet

		//for table
	};

	//array of names of labeled components
	//label means normal axis is set
	this.labeledComponents = [];
	//array of names of components identified
	this.listedComponents = [];


	////////////////////////////////////////////////////////////
	//get info and object
	this.getSize = function() {
		var box = new THREE.Box3();
		box.setFromObject(this.furniture);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);

		//this includes width, height, depth
		return box_size;
	}


	this.getPosition = function() {
		return this.position;
	}

	this.getObjects = function() {
		return this.furniture.children;
	}

	this.getComponentByName = function(name) {
		return this.furniture.getObjectByName(name);
	}

	this.getComponentPosition = function(name) {
		var component = this.getComponentByName(name);
		var worldPosition = new THREE.Vector3();
		component.getWorldPosition(worldPosition);
		return worldPosition;
	}

	this.setCategory = function(category) {
		this.category = category;
	}

	this.setIndex = function(index) {
		this.index = index;
	}

	this.getFurniture = function(){
		return this.furniture;
	}

	this.hasComponent = function(name) {
		for(var i = 0; i < this.listedComponents.length; i++) {
			if(this.listedComponents[i] == name){
				return true;
			}
		}

		return false;
	}


	//get height of a component
	this.getComponentHeight2Floor = function(name) {
		
		//hascomponent has to be true, assuming this is checked
		var component = this.getComponentByName(name);
		
		//check this component's height regardign to the whole body
		//get the box of whole body
		//attention: this is not working for rotated objects, in which case it needs to be rotated back
		var box_1 = new THREE.Box3();
		box_1.setFromObject(this.furniture);

		//get the box of the component
		var box_2 = new THREE.Box3();
		box_2.setFromObject(component);

		//return the distance
		var box_1_center = new THREE.Vector3();
		box_1.getCenter(box_1_center);
		var box_1_size = new THREE.Vector3();
		box_1.getSize(box_1_size);
		var box_1_height_lower_face = box_1_center.y - box_1_size.y / 2;

		var box_2_center = new THREE.Vector3();
		box_2.getCenter(box_2_center);
		var box_2_size = new THREE.Vector3();
		box_2.getSize(box_2_size);
		var box_2_height_higher_face = box_2_center.y + box_2_size.y / 2;

		var height = box_2_height_higher_face - box_1_height_lower_face;

		if(height > 0) 
		{
			return height;
		}

		return -1;
	}


	////////////////////////////////////////////////////////////
	//update info
	this.updatePosition = function(updatedPosition) {
		this.position.copy(updatedPosition);
		this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
	}

	this.updatePosition = function() {
		this.furniture.getWorldPosition(this.position);
		this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
	}

	this.updateDirection = function() {
		this.furniture.getWorldDirection(this.direction);
		this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;
	}

	this.updateQuaternion = function(quaternion) {
		this.quaternion.copy(quaternion);
	}

	this.updateQuaternion = function() {
		this.furniture.getWorldQuaternion(this.quaternion);
	}

	this.updateListedComponents = function(listedComponents) {
		for(var i = 0; i < listedComponents.length; i++) {
			this.addComponentLabel(listedComponents[i]);
		}
	}

	this.updateLabeledComponents = function(labeledComponents) {
		for(var i = 0; i < labeledComponents.length; i++) {
			this.indicateComponentLabeled(labeledComponents[i]);
		}
	}


	////////////////////////////////////////////////////////////
	//update ui
	this.addCard = function(){
		var cards = document.getElementById("cards");
		var card = document.createElement("div");
		card.className = 'card';
		cards.appendChild(card);

		//add title
		var titleDiv = document.createElement("div");
		titleDiv.className = 'content';
		card.appendChild(titleDiv);
		var titleHeader = document.createElement("div");
		titleHeader.className = "header";
		titleHeader.innerHTML = `Furniture ${this.index}`;
		titleDiv.appendChild(titleHeader);

		//add detailed info
		var detailDiv = document.createElement("div");
		detailDiv.className = 'content';
		card.appendChild(detailDiv);

		//add category
		var category = document.createElement('div');
		category.className = 'description';
		category.innerHTML = `Category : ${this.category}`;
		detailDiv.appendChild(category);

		//add size


		//add position in world
		this.positionInfo.className = 'description';
		this.furniture.getWorldPosition(this.position);
		this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
		detailDiv.appendChild(this.positionInfo);

		//add rotation
		
		this.directionInfo.className = 'description';
		this.furniture.getWorldDirection(this.direction);
		this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;
		detailDiv.appendChild(this.directionInfo);

		//add components
		var componentDiv = document.createElement("div");
		componentDiv.className = 'content';
		componentDiv.classList.add("extra");
		card.appendChild(componentDiv);

		var componentMeta = document.createElement("div");
		componentMeta.className = 'meta';
		componentMeta.innerHTML = 'Components';
		componentDiv.appendChild(componentMeta);

		
		this.componentLabels.className = 'ui';
		this.componentLabels.classList.add('very');
		this.componentLabels.classList.add('relaxed');
		this.componentLabels.classList.add('horizontal');
		this.componentLabels.classList.add('list');
		componentDiv.appendChild(this.componentLabels);

	}


	this.addComponentLabel = function(label) {
		var itemLabel = document.createElement("div");
		itemLabel.className = "item";
		itemLabel.setAttribute("id", label + `${this.index}`);
		var itemImg = document.createElement("img");
		itemImg.className = "ui";
		itemImg.classList.add("avatar");
		itemImg.classList.add("image");
		itemImg.src = "/images/avatar/small/daniel.jpg";
		itemLabel.appendChild(itemImg);
		var itemContent = document.createElement("div");
		itemContent.className = "content";
		itemContent.innerHTML = '<span>' + label + '</span>';
		itemLabel.appendChild(itemContent);

		this.componentLabels.appendChild(itemLabel);

		this.listedComponents.push(label);
	}

	this.indicateComponentLabeled = function(name) {

		//console.log("called");
		var itemLabel = $('#' + name + `${this.index}`);

		itemLabel.find("span").css("text-decoration", "underline");
		// //problem
		// var icon = document.createElement("i");
		// icon.className = "star";
		// icon.classList.add("icon");
		// itemLabel.appendChild(icon);

		//todo: check the name is not repeated
		//if components are the same type.. need to label them with different name
		this.labeledComponents.push(name);
	}

	

	////////////////////////////////////////////////////////////
	//apply transformation
	//this is moving in the world coordinates
	this.moveToPosition = function(position) {

		var translation = new THREE.Vector3();
		translation.subVectors(position, this.position);

		var quaternion = new THREE.Quaternion();
		quaternion.copy(this.quaternion);
		quaternion.inverse();
		translation.applyQuaternion(quaternion);

		this.furniture.translateX(translation.x);
		this.furniture.translateY(translation.y);
		this.furniture.translateZ(translation.z);

		this.updatePosition();


	}

	//indicate the object axes
	this.setNormalAxis = function(name, vector) {
		//console.log(name)
		//console.log(vector);

		var targetVector = this.normalAxises[name];
		if(targetVector !== undefined) {
			//compare the vectors and define an rotation matrix
			if(targetVector.equals(vector)) {
				
			}else {
				var tempQuaternion = new THREE.Quaternion();
				tempQuaternion.setFromUnitVectors(vector, targetVector);

				//make the rotation
				this.furniture.applyQuaternion(tempQuaternion);

				//store the rotation info to the qua
				this.quaternion = this.furniture.quaternion;

				//update the ui information
				this.furniture.getWorldDirection(this.direction);
				this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;

			}

			//indicating the label is added to the component
			this.indicateComponentLabeled(name);

		}

	}


	this.setRotationWithNormalAxis = function(name, vector) {

		var originVector = this.normalAxises[name];
		if(originVector !== undefined) {
			//compare the vectors and define an rotation matrix
			if(originVector.equals(vector)) {
				
			}else {
				var tempQuaternion = new THREE.Quaternion();
				tempQuaternion.setFromUnitVectors(originVector, vector);

				//make the rotation
				this.furniture.applyQuaternion(tempQuaternion);

				//store the rotation info to the qua
				this.quaternion = this.furniture.quaternion;

				//update the ui information
				this.furniture.getWorldDirection(this.direction);
				this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;

			}

		}
	}


	

	

	this.lieFlat2Floor = function() {

	}


}







