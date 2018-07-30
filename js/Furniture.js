"use strict;"
function Furniture(furniture) {
	
	this.furniture = furniture; //a group type
	this.objects = []; //a array type of the components
	this.category = null;

	//local positon transformation info
	this.position = new THREE.Vector3();
	//local rotation transformation info
	this.quaternion = new THREE.Quaternion();

	this.setCategory = function(category) {
		this.category = category;
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
		titleHeader.innerHTML = "Furniture One";
		titleDiv.appendChild(titleHeader);

		//add detailed info
		var detailDiv = document.createElement("div");
		detailDiv.className = 'content';
		card.appendChild(detailDiv);

		//add number of components


	}

}