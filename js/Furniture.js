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
		back: new THREE.Vector3(0, 0, 1)
		//for cabinet

		//for table


	};


	this.getObjects = function() {
		return this.furniture.children;
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
		this.positionInfo.innerHTML = `Pos : (x) ${this.position.x} (y) ${this.position.y} (z) ${this.position.z}`;
		detailDiv.appendChild(this.positionInfo);

		//add rotation
		
		this.directionInfo.className = 'description';
		this.furniture.getWorldDirection(this.direction);
		this.directionInfo.innerHTML = `Rot : (x) ${this.direction.x} (y) ${this.direction.y} (z) ${this.direction.z}`;
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
		var itemImg = document.createElement("img");
		itemImg.className = "ui";
		itemImg.classList.add("avatar");
		itemImg.classList.add("image");
		itemImg.src = "/images/avatar/small/daniel.jpg";
		itemLabel.appendChild(itemImg);
		var itemContent = document.createElement("div");
		itemContent.className = "content";
		itemContent.innerHTML = label;
		itemLabel.appendChild(itemContent);

		this.componentLabels.appendChild(itemLabel);

	}


	this.updatePosition = function(updatedPosition) {
		this.position.copy(updatedPosition);
		this.positionInfo.innerHTML = `Pos : (x) ${parseFloat(this.position.x).toFixed(1)} (y) ${parseFloat(this.position.y).toFixed(1)} (z) ${parseFloat(this.position.z).toFixed(1)}`;
	}

	this.updateDirection = function() {

	}

	//indicate the object axes
	this.setNormalAxis = function(name, vector) {
		//console.log(name)
		//console.log(vector);

		var targetVector = this.normalAxises[name];
		if(targetVector !== undefined) {
			//compare the vectors and define an rotation matrix
			if(targetVector.equals(vector)) {
				return;
			}else {
				var tempQuaternion = new THREE.Quaternion();
				tempQuaternion.setFromUnitVectors(vector, targetVector);

				//make the rotation
				this.furniture.applyQuaternion(tempQuaternion);

				//store the rotation info to the qua
				this.quaternion = this.furniture.quaternion;


			}

		}

	}

}







