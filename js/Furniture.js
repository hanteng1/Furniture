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
	this.refNormalAxises = {
		//for chairs
		seat: new THREE.Vector3(0, 1, 0),
		back: new THREE.Vector3(0, 0, 1),
		midframe: new THREE.Vector3(0, 0, 1),

		//for cabinet
		cabinetTop: new THREE.Vector3(0, 1, 0),
		cabinetFront: new THREE.Vector3(0, 0, 1),
		cabinetBroad: new THREE.Vector3(0, 1, 0)

		//for table
	};


	//actual normal axis
	this.normalAxises = {};

	//added bounding box
	this.boundingBoxes = {};

	//after axis added.. eight corners of the boundingbox
	//use Points here
	this.corners = {};
	//points object to manage the transformations of the corners
	this.points;

	//array of names of labeled components
	//label means normal axis is set
	this.labeledComponents = [];
	//array of names of components identified
	this.listedComponents = [];



	//a variable to indicate set normal axis event
	this.hasNormalRotation = false;


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

	//this is not correct
	this.getComponentSize = function(name) {
		var component = this.getComponentByName(name);

		var box = new THREE.Box3();
		box.setFromObject(component);
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

	this.getFurnitureCenter = function() {
		var box = new THREE.Box3();
		box.setFromObject(this.furniture);
		var center = new THREE.Vector3();
		if(box.isEmpty() === false)
		{
			box.getCenter(center);
		}else{
			console.log("error on getting center point");
		}

		return center;
	}


	this.getComponentByName = function(name) {
		return this.furniture.getObjectByName(name);
	}


	this.getComponentInName = function(name, tag) {

		var group = this.getComponentByName(name);

		if(group == undefined) 
		{
			console.log("no such group component");
			return;
		}

		//chair: check has labels seat and back
		if((this.labeledComponents.includes("back") == false) || (this.labeledComponents.includes("seat") == false))
		{
			console.log("missing labels");
			return;
		}

		//see if the group component's direction is in the corrected posiiton
		//no further rotation is made
		var refAxis = this.normalAxises[name];
		if(refAxis.equals(this.refNormalAxises[name]) == false)
		{
			console.log("position info not corrected, further action is needed...");
			return;
		}

		var count = group.children.length;
		if(count == 0) {
			console.log("component has no child, check the name again...");
			return group;
		}

		var groupComponents = [];
		for(var i = 0; i < count; i++) {
			var child = group.children[i];
			var id = child.id;
			var childCenter = this.getObjCenterPosition(child);
			var childObj = {cId: id, cCenter: childCenter};
			groupComponents.push(childObj);
		}

		//order the group components
		var targetId = -1;

		if(tag == "left" || tag == "right")
		{
			//order by x
			groupComponents.sort(function(a, b){return a.cCenter.x - b.cCenter.x});

			if(tag == "left")
			{
				var targetId = groupComponents[0].cId;
			}else if(tag == "right") {
				var targetId = groupComponents[count - 1].cId;
			}

		}else if(tag == "top" || tag == "bottom"){

			//order by y
			groupComponents.sort(function(a, b){return a.cCenter.y - b.cCenter.y});

			if(tag == "bottom")
			{
				var targetId = groupComponents[0].cId;
			}else if(tag == "top") {
				var targetId = groupComponents[count - 1].cId;
			}

		}else if(tag == "front" || tag == "back"){

			//order by z
			groupComponents.sort(function(a, b){return a.cCenter.z - b.cCenter.z});

			if(tag == "back")
			{
				var targetId = groupComponents[0].cId;
			}else if(tag == "front") {
				var targetId = groupComponents[count - 1].cId;
			}
		}else
		{
			console.log("tag name not matched");
			return;
		}


		var targetComponent = group.getObjectById(targetId);

		return targetComponent;

	}


	this.getComponentPosition = function(name) {
		var component = this.getComponentByName(name);
		var worldPosition = new THREE.Vector3();
		component.getWorldPosition(worldPosition);
		return worldPosition;
	}


	this.getComponentCenterPosition = function(name) {
		var component = this.getComponentByName(name);

		var box = new THREE.Box3();
		box.setFromObject(component);
		var center = new THREE.Vector3();
		if(box.isEmpty() === false)
		{
			box.getCenter(center);
		}else{
			console.log("error on getting center point");
		}

		return center;
	}

	this.getObjCenterPosition = function(obj) {

		var box = new THREE.Box3();
		box.setFromObject(obj);
		var center = new THREE.Vector3();
		if(box.isEmpty() === false)
		{
			box.getCenter(center);
		}else{
			console.log("error on getting center point");
		}

		return center;
	}

	this.setCategory = function(category) {
		this.category = category;
	}

	this.setIndex = function(index) {
		this.index = index;
	}

	//set to the property scale
	this.setLoadMatrix = function(loadMatrix) {

		this.getFurniture().applyMatrix(loadMatrix);

		//this.getFurniture().updateMatrix();

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



	//get corner point by name from points
	this.getCornersByName = function(name) {
		
		function findFirstItem(element) {
  			return element == name;
		}

		var index = this.labeledComponents.findIndex(findFirstItem);
		
		var verticesAttribute = this.points.geometry.getAttribute('position');
		var verticesArray = verticesAttribute.array;
		var itemSize = verticesAttribute.itemSize;
		//var verticesNum = verticesArray.length / itemSize;

		var pIndex = index * (itemSize * 4);

		//corners
		//  1 ----- 2
		//  |       |
		//  |       |
		//  4 ----- 3

		//
		var corner_1 = new THREE.Vector3(verticesArray[pIndex], verticesArray[pIndex + 1], verticesArray[pIndex + 2]);
		var corner_2 = new THREE.Vector3(verticesArray[pIndex + 3], verticesArray[pIndex + 4], verticesArray[pIndex + 5]);
		var corner_3 = new THREE.Vector3(verticesArray[pIndex + 6], verticesArray[pIndex + 7], verticesArray[pIndex + 8]);
		var corner_4 = new THREE.Vector3(verticesArray[pIndex + 9], verticesArray[pIndex + 10], verticesArray[pIndex + 11]);

		corner_1.applyMatrix4( this.points.matrixWorld );
		corner_2.applyMatrix4( this.points.matrixWorld );
		corner_3.applyMatrix4( this.points.matrixWorld );
		corner_4.applyMatrix4( this.points.matrixWorld );

		var corners = [];
		corners.push(corner_1);
		corners.push(corner_2);
		corners.push(corner_3);
		corners.push(corner_4);

		return corners;

	}



	////////////////////////////////////////////////////////////
	//update info
	this.updatePosition = function(updatedPosition) {
		this.position.copy(updatedPosition);
		//this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
	}

	this.updatePosition = function() {
		this.furniture.getWorldPosition(this.position);
		//this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
	}

	this.updateDirection = function() {
		this.furniture.getWorldDirection(this.direction);
		//this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;
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
		card.setAttribute("id", "card" + `${this.index}`);
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
		// var detailDiv = document.createElement("div");
		// detailDiv.className = 'content';
		// card.appendChild(detailDiv);

		//add category
		// var category = document.createElemen('div');
		// category.className = 'description';
		// category.innerHTML = `Category : ${this.category}`;
		// detailDiv.appendChild(category);

		// //add size


		// //add position in world
		// this.positionInfo.className = 'description';
		// this.furniture.getWorldPosition(this.position);
		// this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
		// detailDiv.appendChild(this.positionInfo);

		// //add rotation
		
		// this.directionInfo.className = 'description';
		// this.furniture.getWorldDirection(this.direction);
		// this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;
		//detailDiv.appendChild(this.directionInfo);

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


		//add a bounding box to it
		this.addBoundingBox(label);
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


	this.changeComponentLabel = function(prevLabel, curLabel) {

		//console.log("changing name from " + prevLabel + "  to  " + curLabel );

		var itemLabel = $('#' + prevLabel + `${this.index}`);

		itemLabel.find(".content").html('<span>' + curLabel + '</span>');
		itemLabel.find("span").css("text-decoration", "none");

		itemLabel.attr("id", curLabel + `${this.index}`);

		var index = this.listedComponents.indexOf(prevLabel);
		if (index > -1) {
			this.listedComponents.splice(index, 1);
		}

		this.listedComponents.push(curLabel);

		index = this.labeledComponents.indexOf(prevLabel);
		if (index > -1) {
			this.labeledComponents.splice(index, 1);
		}

	}


	//add a bounding box to track labeled component: center, size
	//add it when a component is labelled
	//use this one to calcuate the position, center
	this.addBoundingBox = function(name) {
		var component = this.getComponentByName(name);

		var inverseMatrix = new THREE.Matrix4();
		inverseMatrix.getInverse(this.furniture.matrixWorld, true);

		var box = new THREE.Box3();
		box.setFromObject(component);

		//this box represent the very orignal box without transformation
		//this can be updated all the times
		box.applyMatrix4(inverseMatrix);

		this.boundingBoxes[name] = box;

		//var helper = new THREE.Box3Helper( box, 0xffff00 );
		//this.boundingBoxHelpers

	}


	this.addCorners = function() {

		for(var i = 0; i < this.labeledComponents.length; i++) {
			console.log(this.labeledComponents[i]);
			this.addCornersByName(this.labeledComponents[i]);
		}
	}


	//get the initial eight corners of the referenced object when normal aix is used
	//use these information for cad modelling
	this.addCornersByName = function(name) {
		var component = this.getComponentByName(name);

		//get the box
		var box = new THREE.Box3();
		box.setFromObject(component);

		//get the four surface corners in the clockwise order
		//  1 ----- 2
		//  |       |
		//  |       |
		//  4 ----- 3

		//caution: the compoent has to be aligned with world axis
		var min = box.min;
		var max = box.max;

		var corner_1 = new THREE.Vector3();
		var corner_2 = new THREE.Vector3();
		var corner_3 = new THREE.Vector3();
		var corner_4 = new THREE.Vector3();

		if(this.normalAxises[name].x == 1) {

			corner_1 = new THREE.Vector3(max.x, max.y, max.z);
			corner_2 = new THREE.Vector3(max.x, max.y, min.z);
			corner_3 = new THREE.Vector3(max.x, min.y, min.z);
			corner_4 = new THREE.Vector3(max.x, min.y, max.z);

		}else if(this.normalAxises[name].y == 1) {

			corner_1 = new THREE.Vector3(min.x, max.y, min.z);
			corner_2 = new THREE.Vector3(max.x, max.y, min.z);
			corner_3 = new THREE.Vector3(max.x, max.y, max.z);
			corner_4 = new THREE.Vector3(min.x, max.y, max.z);

		}else if(this.normalAxises[name].z == 1) {

			corner_1 = new THREE.Vector3(min.x, max.y, max.z);
			corner_2 = new THREE.Vector3(max.x, max.y, max.z);
			corner_3 = new THREE.Vector3(max.x, min.y, max.z);
			corner_4 = new THREE.Vector3(min.x, min.y, max.z);

		}
		

		var corners = [];
		corners.push(corner_1);
		corners.push(corner_2);
		corners.push(corner_3);
		corners.push(corner_4);

		this.corners[name] = corners; 		
	}


	//add the corners to the point object
	this.addtoPoint = function() {

		function getRandomInt(max) {
  			return Math.floor(Math.random() * Math.floor(max));
		}

		var geometry = new THREE.BufferGeometry();
		var positions = [];
		var colors = [];
		var color = new THREE.Color();

		for(let key in this.corners) {

			var vx = Math.random();
			var vy = Math.random();
			var vz = Math.random();
			color.setRGB( vx, vy, vz );  //float between 0 and 1.0s

			var corners = this.corners[key];
			for ( var i = 0; i < corners.length; i ++ ) {
				// positions
				var x = corners[i].x;
				var y = corners[i].y;
				var z = corners[i].z;
				positions.push( x, y, z );
				colors.push( color.r, color.g, color.b );
			}
		}
		
		geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
		geometry.computeBoundingSphere();
		//
		var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors } );
		this.points = new THREE.Points( geometry, material );
		//here is its very initial positions... this is not changed while being transformed..

		this.points.name = "points";

		//apply the transformations
		var inverseMatrixWorld = new THREE.Matrix4();
		inverseMatrixWorld.getInverse(this.furniture.matrixWorld.clone(), true);
		this.points.applyMatrix(inverseMatrixWorld);
		this.furniture.add(this.points);

		this.points.visible = false;
	}


	//this is to update the corners with all the applied transformations since it is built
	//to keep track of them
	//stupid method
	this.applyQuaternion2Corners = function(quaternion) {
		
		var furnitureCenter = this.getFurnitureCenter();

		for(let key in this.corners) {
			var corners = this.corners[key];

			for(var i = 0; i < corners.length; i++) {
				//corners[i].applyQuaternion(quaternion);

				//a vector from corner's to the center
				var tempVector = new THREE.Vector3();
				tempVector.subVectors(corners[i], furnitureCenter);

				tempVector.applyQuaternion(quaternion);

				corners[i].addVectors(furnitureCenter, tempVector);
			}
		}
	}

	this.applyTranslation2Corners = function(translation) {
		for(let key in this.corners) {
			var corners = this.corners[key];
			for(var i = 0; i < corners.length; i++) {
				corners[i].add(translation);
			}
		}
	}

	////////////////////////////////////////////////////////////
	//apply transformation
	//this is moving in the world coordinates
	this.moveToPosition = function(position) {

		var translation = new THREE.Vector3();
		translation.subVectors(position, this.position);


		//make trnaslation to cornerss
		//this.applyTranslation2Corners(translation);

		// if(this.points !== undefined) {
		// 	this.points.translateX(translation.x);
		// 	this.points.translateY(translation.y);
		// 	this.points.translateZ(translation.z);
		// }

		var quaternion = new THREE.Quaternion();
		quaternion.copy(this.quaternion);
		quaternion.inverse();
		translation.applyQuaternion(quaternion);

		this.furniture.translateX(translation.x);
		this.furniture.translateY(translation.y);
		this.furniture.translateZ(translation.z);


		//make translation to boudning box
		//todo
		
		

		this.updatePosition();
	}


	this.moveToPositionWithComponentCenter = function(position, name) {
		var translation = new THREE.Vector3();

		var componentCenterPosition = this.getComponentCenterPosition(name);

		translation.subVectors(position, componentCenterPosition);


		//make trnaslation to cornerss
		//this.applyTranslation2Corners(translation);
		// if(this.points !== undefined) {
		// 	this.points.translateX(translation.x);
		// 	this.points.translateY(translation.y);
		// 	this.points.translateZ(translation.z);
		// }


		var quaternion = new THREE.Quaternion();
		quaternion.copy(this.quaternion);
		quaternion.inverse();
		translation.applyQuaternion(quaternion);

		this.furniture.translateX(translation.x);
		this.furniture.translateY(translation.y);
		this.furniture.translateZ(translation.z);

		//make translation to boudning box
		//todo

		
		


		

		this.updatePosition();
	}



	//indicate the object axes
	this.setNormalAxis = function(name, vector) {
		//console.log(name)
		//console.log(vector);

		//deal with name string, if there is -, get the last
		var names = name.split("-");
		//console.log(names);
		var usingName = names[names.length - 1];

		var targetVector = this.refNormalAxises[usingName];
		if(targetVector !== undefined) {
			//compare the vectors and define an rotation matrix
			if(targetVector.equals(vector)) {
				
			}else {
				var tempQuaternion = new THREE.Quaternion();
				tempQuaternion.setFromUnitVectors(vector, targetVector);

				//make the rotation
				this.furniture.applyQuaternion(tempQuaternion);


				//make the rotation for the existing boundingbox
				//todo...\
				// if(this.points !== undefined)
				// 	this.points.applyQuaternion(tempQuaternion);


				//make the rotation for the existing corners
				//this.applyQuaternion2Corners(tempQuaternion);


				//store the rotation info to the qua
				this.quaternion = this.furniture.quaternion;

				//update the ui information
				this.furniture.getWorldDirection(this.direction);
				//this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;

			}

			//indicating the label is added to the component
			this.indicateComponentLabeled(name);


			//add the actual normal axis
			this.normalAxises[usingName] = new THREE.Vector3();
			this.normalAxises[usingName].copy(targetVector);

			//todo.. will this change the other normal vectors?


			//add the corners
			//do not add it here.. there are explode and collapse operations
			//this.addCorners(name);

			//attention, might have problem
			this.hasNormalRotation = true;

		}

	}


	this.setRotationWithNormalAxis = function(name, vector) {

		if(name in this.normalAxises) {
			var originVector = this.normalAxises[name];

			//console.log("");
			//console.log(originVector);
			//console.log(vector);

			if(originVector !== undefined) {
				//compare the vectors and define an rotation matrix
				if(originVector.equals(vector)) {
					
				}else {
					var tempQuaternion = new THREE.Quaternion();
					tempQuaternion.setFromUnitVectors(originVector, vector);

					//make the rotation for the existing corners
					//this.applyQuaternion2Corners(tempQuaternion);

					//make the rotation
					this.furniture.applyQuaternion(tempQuaternion);

					//this may change the other normal vectors
					for(let key in this.normalAxises){
						if(key !== name){
							this.normalAxises[key].applyQuaternion(tempQuaternion);
							this.normalAxises[key].normalize();
						}
					}

					this.normalAxises[name].copy(vector);


					//make the rotation for the existing boundingbox
					//todo...
					// if(this.points !== undefined)
					// 	this.points.applyQuaternion(tempQuaternion);
					

					//store the rotation info to the qua
					this.quaternion = this.furniture.quaternion;

					//update the ui information
					this.furniture.getWorldDirection(this.direction);
					//this.directionInfo.innerHTML = `Rot : (x) ${parseFloat(this.direction.x).toFixed(1)} (y) ${parseFloat(this.direction.y).toFixed(1)} (z) ${parseFloat(this.direction.z).toFixed(1)}`;

				}

				

			}
		}

		
	}


	

	

	this.lieFlat2Floor = function() {

	}

	//zhuen's block





	//end of zhuen's block




	//weixiang's block




	//end of weixiang's block



	//trif's block




	//end of trif's block


}







