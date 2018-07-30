"use strict;"
function Furniture(furniture) {
	
	this.furniture = furniture; //a group type
	this.objects = []; //a array type of the components
	this.category = null;
	this.index = null;
	//world positon transformation info
	this.position = new THREE.Vector3();
	//local rotation transformation info
	this.quaternion = new THREE.Quaternion();
	//world diretion, direction of object's positive z
	this.direction = new THREE.Vector3();


	this.setObjects = function(objects) {
		this.objects = objects;
	}

	this.getObjects = function() {
		return this.objects;
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
		var position = document.createElement('div');
		position.className = 'description';
		this.furniture.getWorldPosition(this.position);
		position.innerHTML = `Position : (x) ${this.position.x} (y) ${this.position.y} (z) ${this.position.z}`;
		detailDiv.appendChild(position);

		//add rotation
		var direction = document.createElement('div');
		direction.className = 'description';
		this.furniture.getWorldDirection(this.direction);
		direction.innerHTML = `Rotation : (x) ${this.direction.x} (y) ${this.direction.y} (z) ${this.direction.z}`;
		detailDiv.appendChild(direction);

		//add components



	}

	this.updatePosition = function() {

	}

	this.updateDirection = function() {

	}

	//indicate the object axes
	

}