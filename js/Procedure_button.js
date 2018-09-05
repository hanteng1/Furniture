"use strict;"

function Procedure_button(main, str){

	if(main.GetSizeObj.length == 0){
		main.GetSizeObj.push(0);
		return;
	}

	var btn = document.createElement("button");
	btn.classList.add("ui","circular","icon","button","procedure",
					  main.GetSizeObj.length.toString());
	//console.log(btn.classList[4]);
	var t = document.createTextNode(str);       
	btn.appendChild(t);
	//var icon = document.createElement("i");
	//icon.classList.add("facebook","icon");
    //btn.appendChild(icon);
    //document.body.appendChild(btn);
    
    document.getElementById("Procedure_List").appendChild(btn);


}
function RecordPosition(main){
	var recordPosi = [];
	for(var i=0; i< main.furnitures.length ; i++){
		var furniture = main.furnitures[i].getFurniture();
		var position = new THREE.Vector3(furniture.x,
										 furniture.y,
										 furniture.z);
		recordPosi.push(position);

	}
	main.stepFurniturePosition.push(recordPosi);
	
	recordPosi = [];
	for(var i=0; i< main.Objects.length ; i++){
		var obj = main.Objects[i];
		var position = new THREE.Vector3(obj.x, obj.y, obj.z);
		recordPosi.push(position);

	}
	main.stepObjectPosition.push(recordPosi);
}


module.exports = {Procedure_button,RecordPosition}