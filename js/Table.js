"use strict;"

const chairCreateBoard = require('./chairCreateBoard')
const CreateWheel = require('./CreateWheel')
const CreateSupport = require('./CreateSupport')
const CreateDrawer = require('./CreateDrawer')
const CreateTableRod = require('./CreateTableRod')
const CabinetMakeSeat = require('./CabinetMakeSeat')
const CreateDoorBoard = require('./CreateDoorBoard')


function Table (main){
	this.main = main;
	this.furnitures = main.furnitures;

}

Table.prototype = {
	checkTableInfo: function(Table) {
		// body...
		var tabletop = Table.getComponentByName("tTop");
		var tableLeg = Table.getComponentByName("tLeg");
		if(typeof tabletop == 'undefined' || typeof tableLeg == 'undefined')
			return false;
		return true;
	},

	getPartSize: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_size = new THREE.Vector3();
		box.getSize(box_size);
		return box_size;
	},

	getPartCenter: function(obj){
		var box = new THREE.Box3();
		box.setFromObject(obj);
		var box_center = new THREE.Vector3();
		box.getCenter (box_center);
		return box_center;
	},

	getPartMaterial: function(obj) {
		var material = new THREE.Material();
		if(obj.children.length > 0){
			var child = obj.children[0];
			while(child.children.length)
				child = child.children[0];
			if (Array.isArray(child.material))
				material = child.material[0];			
			else
				material = child.material;
		}
		else{
			if (Array.isArray(obj.material))
				material = obj.material[0];			
			else
				material = obj.material;			
		}

		return material;
	},

	rotationByAxis: function(furniture, axis, degree){
		var obj = furniture.getFurniture();
		var size = this.getPartSize(obj);
		var center = this.getPartCenter(obj);
		obj.position.set(0, 0, -30);
		if(axis == 'x'){			
			obj.rotateOnWorldAxis(new THREE.Vector3(1,0,0), degree);			
		}
		if(axis == 'y'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,1,0), degree);
		}
		if(axis == 'z'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,0,1), degree);
		}
		var newCenter = this.getPartCenter(obj);
		var offset = new THREE.Vector3(center.x - newCenter.x, center.y - newCenter.y, center.z - newCenter.z);
		obj.position.x += offset.x;
		obj.position.y += offset.y;
		obj.position.z += offset.z;		
	},

	objectRotationByAxis: function(obj, axis, degree){
		var size = this.getPartSize(obj);
		var center = this.getPartCenter(obj);
		obj.position.set(0, 0, -30);
		if(axis == 'x'){			
			obj.rotateOnWorldAxis(new THREE.Vector3(1,0,0), degree);			
		}
		if(axis == 'y'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,1,0), degree);
		}
		if(axis == 'z'){
			obj.rotateOnWorldAxis(new THREE.Vector3(0,0,1), degree);
		}
		var newCenter = this.getPartCenter(obj);
		var offset = new THREE.Vector3(center.x - newCenter.x, center.y - newCenter.y, center.z - newCenter.z);
		obj.position.x += offset.x;
		obj.position.y += offset.y;
		obj.position.z += offset.z;		
	},

	objectAddToFurniture: function(furniture, object, position) {
		var inverse = new THREE.Matrix4();
		inverse.getInverse(furniture.matrixWorld);	
		object.applyMatrix(inverse);		
		furniture.worldToLocal(position);		
		object.position.set(position.x, position.y, position.z);		
		furniture.add(object);		
	},

	getLongestContinueNumber: function(array1, array2){
		var result = new Array();
		for(var i=0; i < array1.length; i++){
			var tmp = new Array();
			for(var j=0, offset = 0; j < array2.length && offset < array1.length - i; j++){
				if(array1[i + offset].index == array2[j].index){
					tmp.push(array1[i + offset]);
					offset++;
				}
			}
			if(tmp.length > result.length)
				result = tmp;
		}
		return result;
	},

	getCanStackTables: function(Tables, result){
		var TablesBigEdge = new Array();
		var TablesSmallEdge = new Array();
		for (var i = 0; i < Tables.length; i++) {
			TablesBigEdge.push(Tables[i]);
		}
		TablesBigEdge.sort(function(a, b){
			var aSize = a.getSize();
			var bSize = b.getSize();
			if(aSize.x > aSize.z)
				var aBigEdge =  aSize.x;
			else
				var aBigEdge =  aSize.z;
			if(bSize.x > bSize.z)
				var bBigEdge =  bSize.x;
			else
				var bBigEdge =  bSize.z;
			return bBigEdge - aBigEdge; // sort: big to small
		}); 

		TablesSmallEdge = TablesBigEdge.slice(0)
		TablesSmallEdge.sort(function(a, b){
			var aSize = a.getSize();
			var bSize = b.getSize();
			if(aSize.x > aSize.z)
				var aSmallEdge =  aSize.z;
			else
				var aSmallEdge =  aSize.x;
			if(bSize.x > bSize.z)
				var bSmallEdge =  bSize.z;
			else
				var bSmallEdge =  bSize.x;
			return bSmallEdge - aSmallEdge; // sort: big to small
		}); 

		var tmp1 = new Array();
		var tmp2 = new Array();
		var ids = new Array();
		for (var i = 0, flag = true; i < Tables.length; i++) {
			if(TablesBigEdge[i].index == TablesSmallEdge[i].index){
				if (tmp1.length > 0) {					
					ids = this.getLongestContinueNumber(tmp1, tmp2);
					for (var i = 0; i < ids.length; i++) {
						result.push(ids[i]);
					}
					tmp1 = [];
					tmp2 = [];
					ids = [];
				}
				result.push(TablesBigEdge[i]);
			}
			else{				
				tmp1.push(TablesBigEdge[i]);
				tmp2.push(TablesSmallEdge[i]);				
			}			
		}
		if(tmp1.length > 0){
			ids = this.getLongestContinueNumber(tmp1, tmp2);
			for (var i = 0; i < ids.length; i++) {
				result.push(ids[i]);
			}
		}
	},

	stackEvent: function() {
		var stackTables = new Array();
		this.getCanStackTables(this.furnitures, stackTables);
		console.log(stackTables);

		for (var i = 0, offset = 0; i < stackTables.length; i++) {
			stackTables[i].moveToPosition(new THREE.Vector3(0, offset, -30));
			var size = stackTables[i].getSize();
			offset += size.y;
		}
	},

	getCanFlipStackTables: function(Tables, result){
		var marked = new Array();
		for (var i = 0; i < Tables.length; i++) {
			marked[i] = false;
		}

		for (var i = 0, count = 0; i < Tables.length; i++) {
			var aSize = Tables[i].getSize();
			if(aSize.x > aSize.z)
				var aBigEdge =  aSize.x;
			else
				var aBigEdge =  aSize.z;
			var aXaddZ = aSize.x + aSize.z;
			if(!marked[i]){
				result[count].push(Tables[i]);
				for (var j = 0; j < Tables.length; j++) {
					if(i==j || marked[j]);
					else{

						var bSize = Tables[j].getSize();
						if(bSize.x > bSize.z)
							var bBigEdge =  bSize.x;
						else
							var bBigEdge =  bSize.z;
						var bXaddZ = bSize.x + bSize.z;
						console.log(Tables[i]);
						console.log(aBigEdge + " , " + aXaddZ);
						console.log(Tables[j]);
						console.log(bBigEdge + " , " + bXaddZ);
						if(aBigEdge.toFixed(6) == bBigEdge.toFixed(6) && aXaddZ.toFixed(6) == bXaddZ.toFixed(6)){
							result[count].push(Tables[j]);
							marked[j] = true;
						}
					}
				}
				count++;
			}
			
		}
		var i = 0;
		while(result[i].length > 1){
			i++;
		}
		result.splice(i, result.length - i);
	},

	flipStackEvent: function() {
		var flipStackTables = [];
		for (var i = 0; i < this.furnitures.length; i++) {
			flipStackTables[i] = [];
		}
		this.getCanFlipStackTables(this.furnitures, flipStackTables);
		console.log("flipStackEvent");
		console.log(flipStackTables);		

		for (var i = 0; i < flipStackTables.length; i++) {
			if(flipStackTables[i].length % 2 == 0){
				for (var j = 0; j < flipStackTables[i].length; j += 2) {					
					this.rotationByAxis(flipStackTables[i][j], 'x', Math.PI);
					var obj1 = flipStackTables[i][j].getFurniture();
					var obj2 = flipStackTables[i][j+1].getFurniture();
					var obj1Center = this.getPartCenter(obj1);
					var obj1Size = this.getPartSize(obj1);
					var obj2Center = this.getPartCenter(obj2);
					var obj2Size = this.getPartSize(obj2);
					var obj2NewCenter = new THREE.Vector3(obj1Center.x, 
						obj1Center.y + obj1Size.y/2 + obj2Size.y/2, obj1Center.z);
					var offset = new THREE.Vector3(obj2NewCenter.x - obj2Center.x, 
						obj2NewCenter.y - obj2Center.y, obj2NewCenter.z - obj2Center.z);
					obj2.position.x += offset.x;
					obj2.position.y += offset.y;
					obj2.position.z += offset.z;

					var tabletop = obj1.getObjectByName("tTop");
					var tabletopMaterial = this.getPartMaterial(tabletop);
					var boardGeometry = chairCreateBoard(obj1Size.x, 0.05, obj1Size.z);
					var board = new THREE.Mesh(boardGeometry, tabletopMaterial);

					board.position.set(obj1Center.x - obj1Size.x/2, obj1Center.y + obj1Size.y/2, 
						obj1Center.z - obj1Size.z/2);
					this.main.scene.add(board);
				}
			}
		}		
	},

	getAllChildren: function(obj, array) {
		if (obj.children.length > 0) {
			for (var i = 0; i < obj.children.length; i++) {
				if(obj.children[i].type == "Mesh" || obj.children[i].type == "Object3D"){
					this.getAllChildren(obj.children[i], array);
				}	
			}
		}
		else
			array.push(obj);			
	},

	getPointByRay: function(obj, origin, direction) {
		var raycaster = new THREE.Raycaster();
		raycaster.set(origin, direction);
		if(obj.children.length > 0){
			var array = new Array();
			this.getAllChildren(obj, array);
			var intersects = raycaster.intersectObjects(array);
		}
		else
			var intersects = raycaster.intersectObject(obj);
		return intersects;
	},

	test: function(pos) {
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var cube = new THREE.Mesh( geometry, material );
		cube.position.set(pos.x, pos.y, pos.z);
		this.main.scene.add( cube );
	},

	getNumber1LegBottom: function(Table) {
		var tableCenter = this.getPartCenter(Table);
		var tableSize = this.getPartSize(Table);
		var tableLeg = Table.getObjectByName("tLeg");
		//get middle x position (pos1+pos2)/2
		var origin1 = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - tableSize.z/2 + 0.01);
		var direction1 = new THREE.Vector3(-1, 0, 0);
		var intersects1 = this.getPointByRay(tableLeg, origin1, direction1);
		if(intersects1.length > 0)
			var pos1 = intersects1[0].point;
		else
			console.log("number1 raycaster1 miss");

		var origin2 = new THREE.Vector3(tableCenter.x - tableSize.x, tableCenter.y, tableCenter.z - tableSize.z/2 + 0.01);
		var direction2 = new THREE.Vector3(1, 0, 0);
		var intersects2 = this.getPointByRay(tableLeg, origin2, direction2);
		if(intersects2.length > 0)
			var pos2 = intersects2[0].point;
		else
			console.log("number1 raycaster2 miss");

		//get middle z position (pos3+pos4)/2
		var origin3 = new THREE.Vector3(tableCenter.x - tableSize.x/2 + 0.01, tableCenter.y, tableCenter.z);
		var direction3 = new THREE.Vector3(0, 0, -1);
		var intersects3 = this.getPointByRay(tableLeg, origin3, direction3);
		if(intersects3.length > 0)
			var pos3 = intersects3[0].point;
		else
			console.log("number1 raycaster3 miss");			

		var origin4 = new THREE.Vector3(tableCenter.x - tableSize.x/2 + 0.01, tableCenter.y, tableCenter.z - tableSize.z);
		var direction4 = new THREE.Vector3(0, 0, 1);
		var intersects4 = this.getPointByRay(tableLeg, origin4, direction4);
		if(intersects4.length > 0)
			var pos4 = intersects4[0].point;
		else
			console.log("number1 raycaster4 miss");			

		//get y
		var origin5 = new THREE.Vector3((pos1.x+pos2.x)/2, tableCenter.y - tableSize.y, (pos3.z+pos4.z)/2);
		var direction5 = new THREE.Vector3(0, 1, 0);
		var intersects5 = this.getPointByRay(tableLeg, origin5, direction5);
		if(intersects5.length > 0)
			var pos5 = intersects5[0].point;
		else
			console.log("number1 raycaster5 miss");
		return new THREE.Vector3((pos1.x+pos2.x)/2, pos5.y, (pos3.z+pos4.z)/2);
	},

	getNumber2LegBottom: function(Table) {
		var tableCenter = this.getPartCenter(Table);
		var tableSize = this.getPartSize(Table);
		var tableLeg = Table.getObjectByName("tLeg");
		//get middle x position (pos1+pos2)/2
		var origin1 = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z - tableSize.z/2 + 0.01);
		var direction1 = new THREE.Vector3(1, 0, 0);
		var intersects1 = this.getPointByRay(tableLeg, origin1, direction1);
		if(intersects1.length > 0)
			var pos1 = intersects1[0].point;
		else
			console.log("number2 raycaster1 miss");

		var origin2 = new THREE.Vector3(tableCenter.x + tableSize.x, tableCenter.y, tableCenter.z + tableSize.z/2 - 0.01);
		var direction2 = new THREE.Vector3(-1, 0, 0);
		var intersects2 = this.getPointByRay(tableLeg, origin2, direction2);
		if(intersects2.length > 0)
			var pos2 = intersects2[0].point;
		else
			console.log("number2 raycaster2 miss");

		//get middle z position (pos3+pos4)/2
		var origin3 = new THREE.Vector3(tableCenter.x - tableSize.x/2 + 0.01, tableCenter.y, tableCenter.z);
		var direction3 = new THREE.Vector3(0, 0, -1);
		var intersects3 = this.getPointByRay(tableLeg, origin3, direction3);
		if(intersects3.length > 0)
			var pos3 = intersects3[0].point;
		else
			console.log("number2 raycaster3 miss");			

		var origin4 = new THREE.Vector3(tableCenter.x - tableSize.x/2 + 0.01, tableCenter.y, tableCenter.z - tableSize.z);
		var direction4 = new THREE.Vector3(0, 0, 1);
		var intersects4 = this.getPointByRay(tableLeg, origin4, direction4);
		if(intersects4.length > 0)
			var pos4 = intersects4[0].point;
		else
			console.log("number2 raycaster4 miss");			

		//get y
		var origin5 = new THREE.Vector3((pos1.x+pos2.x)/2, tableCenter.y - tableSize.y, (pos3.z+pos4.z)/2);
		var direction5 = new THREE.Vector3(0, 1, 0);
		var intersects5 = this.getPointByRay(tableLeg, origin5, direction5);
		if(intersects5.length > 0)
			var pos5 = intersects5[0].point;
		else
			console.log("number2 raycaster5 miss");
		return new THREE.Vector3((pos1.x+pos2.x)/2, pos5.y, (pos3.z+pos4.z)/2);
	},

	getNumber3LegBottom: function(Table) {
		var tableCenter = this.getPartCenter(Table);
		var tableSize = this.getPartSize(Table);
		var tableLeg = Table.getObjectByName("tLeg");
		//get middle x position (pos1+pos2)/2
		var origin1 = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z + tableSize.z/2 - 0.01);
		var direction1 = new THREE.Vector3(1, 0, 0);
		var intersects1 = this.getPointByRay(tableLeg, origin1, direction1);
		if(intersects1.length > 0)
			var pos1 = intersects1[0].point;
		else
			console.log("number3 raycaster1 miss");

		var origin2 = new THREE.Vector3(tableCenter.x + tableSize.x, tableCenter.y, tableCenter.z + tableSize.z/2 - 0.01);
		var direction2 = new THREE.Vector3(-1, 0, 0);
		var intersects2 = this.getPointByRay(tableLeg, origin2, direction2);
		if(intersects2.length > 0)
			var pos2 = intersects2[0].point;
		else
			console.log("number3 raycaster2 miss");

		//get middle z position (pos3+pos4)/2
		var origin3 = new THREE.Vector3(tableCenter.x + tableSize.x/2 - 0.01, tableCenter.y, tableCenter.z);
		var direction3 = new THREE.Vector3(0, 0, 1);
		var intersects3 = this.getPointByRay(tableLeg, origin3, direction3);
		if(intersects3.length > 0)
			var pos3 = intersects3[0].point;
		else
			console.log("number3 raycaster3 miss");			

		var origin4 = new THREE.Vector3(tableCenter.x + tableSize.x/2 - 0.01, tableCenter.y, tableCenter.z + tableSize.z);
		var direction4 = new THREE.Vector3(0, 0, -1);
		var intersects4 = this.getPointByRay(tableLeg, origin4, direction4);
		if(intersects4.length > 0)
			var pos4 = intersects4[0].point;
		else
			console.log("number3 raycaster4 miss");			

		//get y
		var origin5 = new THREE.Vector3((pos1.x+pos2.x)/2, tableCenter.y - tableSize.y, (pos3.z+pos4.z)/2);
		var direction5 = new THREE.Vector3(0, 1, 0);
		var intersects5 = this.getPointByRay(tableLeg, origin5, direction5);
		if(intersects5.length > 0)
			var pos5 = intersects5[0].point;
		else
			console.log("number3 raycaster5 miss");
		return new THREE.Vector3((pos1.x+pos2.x)/2, pos5.y, (pos3.z+pos4.z)/2);
	},

	getNumber4LegBottom: function(Table) {
		var tableCenter = this.getPartCenter(Table);
		var tableSize = this.getPartSize(Table);
		var tableLeg = Table.getObjectByName("tLeg");
		//get middle x position (pos1+pos2)/2
		var origin1 = new THREE.Vector3(tableCenter.x, tableCenter.y, tableCenter.z + tableSize.z/2 - 0.01);
		var direction1 = new THREE.Vector3(-1, 0, 0);
		var intersects1 = this.getPointByRay(tableLeg, origin1, direction1);
		if(intersects1.length > 0)
			var pos1 = intersects1[0].point;
		else
			console.log("number4 raycaster1 miss");

		var origin2 = new THREE.Vector3(tableCenter.x - tableSize.x, tableCenter.y, tableCenter.z + tableSize.z/2 - 0.01);
		var direction2 = new THREE.Vector3(1, 0, 0);
		var intersects2 = this.getPointByRay(tableLeg, origin2, direction2);
		if(intersects2.length > 0)
			var pos2 = intersects2[0].point;
		else
			console.log("number4 raycaster2 miss");

		//get middle z position (pos3+pos4)/2
		var origin3 = new THREE.Vector3(tableCenter.x + tableSize.x/2 - 0.01, tableCenter.y, tableCenter.z);
		var direction3 = new THREE.Vector3(0, 0, 1);
		var intersects3 = this.getPointByRay(tableLeg, origin3, direction3);
		if(intersects3.length > 0)
			var pos3 = intersects3[0].point;
		else
			console.log("number4 raycaster3 miss");			

		var origin4 = new THREE.Vector3(tableCenter.x + tableSize.x/2 - 0.01, tableCenter.y, tableCenter.z + tableSize.z);
		var direction4 = new THREE.Vector3(0, 0, -1);
		var intersects4 = this.getPointByRay(tableLeg, origin4, direction4);
		if(intersects4.length > 0)
			var pos4 = intersects4[0].point;
		else
			console.log("number4 raycaster4 miss");			

		//get y
		var origin5 = new THREE.Vector3((pos1.x+pos2.x)/2, tableCenter.y - tableSize.y, (pos3.z+pos4.z)/2);
		var direction5 = new THREE.Vector3(0, 1, 0);
		var intersects5 = this.getPointByRay(tableLeg, origin5, direction5);
		if(intersects5.length > 0)
			var pos5 = intersects5[0].point;
		else
			console.log("number4 raycaster5 miss");
		return new THREE.Vector3((pos1.x+pos2.x)/2, pos5.y, (pos3.z+pos4.z)/2);
	},

	getLegBottomCenterPosition: function(Table, number) {
		var tableCenter = this.getPartCenter(Table);
		var tableSize = this.getPartSize(Table);
		var tableLeg = Table.getObjectByName("tLeg");

		if(number == 1){
			return this.getNumber1LegBottom(Table);
		}
		else if(number == 2){
			return this.getNumber2LegBottom(Table);
		}
		else if(number == 3){
			return this.getNumber3LegBottom(Table);
		}
		else if(number == 4){
			return this.getNumber4LegBottom(Table);
		}
	},

	getLegsPosition: function(Table, positions) {
		positions.push(this.getLegBottomCenterPosition(Table, 1));
		positions.push(this.getLegBottomCenterPosition(Table, 2));
		positions.push(this.getLegBottomCenterPosition(Table, 3));
		positions.push(this.getLegBottomCenterPosition(Table, 4));		
	},

	addWheelEvent: function() {
		var table = this.furnitures[0].getFurniture();

		var legsPosition = [];
		this.getLegsPosition(table, legsPosition);

		var tabletop = table.getObjectByName("tTop");
		var material = this.getPartMaterial(tabletop);
		var geometry = CreateWheel();
		var wheel = new THREE.Mesh(geometry, material);
		wheel.name = "wheel";
		var wheelSize = this.getPartSize(wheel);

		// 0 ---- 1
		// |      |
		// |      |
		// 3 ---- 2
		var wheelArray =[4];
		for (var i = 0; i < 4; i++) {
			wheelArray[i] = new THREE.Object3D();
		}
		for (var i = 0; i < 4; i++) {
			wheelArray[i] = wheel.clone();
		}
		
		for (var i = 0; i < 4; i++) {
			legsPosition[i].y = legsPosition[i].y - wheelSize.y/2;
			this.objectAddToFurniture(table, wheelArray[i], legsPosition[i]);
		}		

		table.position.y = table.position.y + wheelSize.y;
	},

	getTabletopSurfaceCenterPoint: function(Table) {
		var tabletop = Table.getObjectByName("tTop");
		var tabletopSize = this.getPartSize(tabletop);
		var tabletopCenter = this.getPartCenter(tabletop);
		var origin = new THREE.Vector3(tabletopCenter.x, tabletopCenter.y + tabletopSize.y, tabletopCenter.z);
		var direction = new THREE.Vector3(0,-1,0);

		var intersects = this.getPointByRay(tabletop, origin, direction);
		if(intersects.length > 0){
			return intersects[0].point;
		}
		else
			console.log("Tabletop Surface Center Point miss");
	},

	addBoardOnTabletop: function() {
		var table = this.furnitures[0].getFurniture();
		var surfaceCenterPoint = this.getTabletopSurfaceCenterPoint(table);
		var tabletop = table.getObjectByName("tTop");
		var tabletopSize = this.getPartSize(tabletop);
		// 0 ---- 1
		// |      |
		// |      |
		// 3 ---- 2
		var pos = [];

		pos.push(new THREE.Vector3(surfaceCenterPoint.x - tabletopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z - tabletopSize.z/4));
		pos.push(new THREE.Vector3(surfaceCenterPoint.x + tabletopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z - tabletopSize.z/4));
		pos.push(new THREE.Vector3(surfaceCenterPoint.x + tabletopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z + tabletopSize.z/4));
		pos.push(new THREE.Vector3(surfaceCenterPoint.x - tabletopSize.x/4, surfaceCenterPoint.y, surfaceCenterPoint.z + tabletopSize.z/4));

		var material = this.getPartMaterial(tabletop);
		var geometry = CreateSupport(1);
		var support = new THREE.Mesh(geometry, material);
		support.name = "support";

		var supportSize = this.getPartSize(support);
		
		var supportArray = [];
		for (var i = 0; i < 4; i++) {
			supportArray[i] = new THREE.Object3D();
			supportArray[i] = support.clone();
			var tmp = new THREE.Vector3(pos[i].x, pos[i].y + supportSize.y/2, pos[i].z);
			this.objectAddToFurniture(table, supportArray[i], tmp);
		}
		
		var offset = 2;
		geometry = chairCreateBoard(tabletopSize.x + offset, tabletopSize.y, tabletopSize.z + offset);
		var board = new THREE.Mesh(geometry, material);
		board.name = "board";
		var boardSize = this.getPartSize(board);
		var boardpos = new THREE.Vector3(surfaceCenterPoint.x - boardSize.x/2, 
			surfaceCenterPoint.y + supportSize.y + 0.12, surfaceCenterPoint.z - boardSize.z/2);
		// this.test(new THREE.Vector3(surfaceCenterPoint.x, surfaceCenterPoint.y + supportSize.y, surfaceCenterPoint.z));
		this.objectAddToFurniture(table, board, boardpos);
	},

	addBoard: function() {
		var table = this.furnitures[0].getFurniture();
		var tabletop = table.getObjectByName("tTop");
		var tableCenter = this.getPartCenter(table);
		var tabletopCenter =  this.getPartCenter(tabletop);
		var tabletopSize = this.getPartSize(tabletop);
		var material = this.getPartMaterial(tabletop);
		var geometry = chairCreateBoard(tabletopSize.x, 0.03, tabletopSize.z);
		var board = new THREE.Mesh(geometry, material);
		board.name = "board";
		var boardSize = this.getPartSize(board);
		var pos = new THREE.Vector3((tableCenter.x + tabletopCenter.x)/2 - boardSize.x/2 + 0.12, 
			tabletopCenter.y - 2 - boardSize.y/2, 
			(tableCenter.z + tabletopCenter.z)/2 - boardSize.z/2 + 0.12);
		this.objectAddToFurniture(table, board, pos);
	},

	addDrawer: function(){
		var table = this.furnitures[0].getFurniture();
		var tableSize = this.getPartSize(table);
		var tableCenter = this.getPartCenter(table);
		var tabletop = table.getObjectByName("tTop");
		this.addBoard();		
		var board = table.getObjectByName("board");
		var boardCenter = this.getPartCenter(board);
		var boardSize = this.getPartSize(board);
		var tmp = new THREE.Vector3(tableCenter.x, boardCenter.y + boardSize.y/2 + 0.01, tableCenter.z);

		if(tableSize.x > tableSize.z){
			var origin = new THREE.Vector3(tmp.x, tmp.y, tmp.z + tableSize.z/2 - 0.01);
			var direction1 = new THREE.Vector3(1,0,0);
			var direction2 = new THREE.Vector3(-1,0,0);
			var direction3 = new THREE.Vector3(0,1,0);
			var direction4 = new THREE.Vector3(0,-1,0);
			var intersects1 = this.getPointByRay(table, origin, direction1);
			var intersects2 = this.getPointByRay(table, origin, direction2);
			var intersects3 = this.getPointByRay(table, origin, direction3);
			var intersects4 = this.getPointByRay(board, origin, direction4);
			if(intersects1.length > 0)
				var right = intersects1[0].point;
			else
				console.log("x > z intersects1 miss");
			if(intersects2.length > 0)
				var left = intersects2[0].point;
			else
				console.log("x > z intersects2 miss");
			if(intersects3.length > 0)
				var up = intersects3[0].point;
			else
				console.log("x > z intersects3 miss");
			if(intersects4.length > 0)
				var down = intersects4[0].point;
			else
				console.log("x > z intersects4 miss");

			var lengthX = right.x - left.x;
			var lengthY = up.y - down.y;

			var width = lengthX / 3;
			var length = boardSize.z / 3;
			var height = lengthY;
			
			var material = this.getPartMaterial(tabletop);
			var geometry = CreateDrawer(width, length, height);
			var drawer = new THREE.Mesh(geometry, material);
			drawer.name = "drawer";
			var drawerSize = this.getPartSize(drawer);
			var drawerArray = [];
			for (var i = 0, offset = 0; i < 3; i++, offset += drawerSize.z/3) {
				drawerArray[i] = new THREE.Object3D();
				drawerArray[i] = drawer.clone();
				var tmp = new THREE.Vector3(boardCenter.x - drawerSize.x/2 - width + width*i, 
					boardCenter.y + 0.12, boardCenter.z + drawerSize.z/2 + offset);
				this.objectAddToFurniture(table, drawerArray[i], tmp);
			}
		}
		else{
			var origin = new THREE.Vector3(tmp.x - tableSize.x/2 + 0.01, tmp.y, tmp.z);
			var direction1 = new THREE.Vector3(0,0,1);
			var direction2 = new THREE.Vector3(0,0,-1);
			var direction3 = new THREE.Vector3(0,1,0);
			var direction4 = new THREE.Vector3(0,-1,0);
			var intersects1 = this.getPointByRay(table, origin, direction1);
			var intersects2 = this.getPointByRay(table, origin, direction2);
			var intersects3 = this.getPointByRay(table, origin, direction3);
			var intersects4 = this.getPointByRay(board, origin, direction4);
			if(intersects1.length > 0)
				var right = intersects1[0].point;
			else
				console.log("x <= z intersects1 miss");

			if(intersects2.length > 0)
				var left = intersects2[0].point;
			else
				console.log("x <= z intersects2 miss");

			if(intersects3.length > 0)
				var up = intersects3[0].point;
			else
				console.log("x <= z intersects3 miss");

			if(intersects4.length > 0)
				var down = intersects4[0].point;
			else
				console.log("x <= z intersects4 miss");

			var lengthZ = right.z - left.z;
			var lengthY = up.y - down.y;

			var width = lengthZ / 3;
			var length = boardSize.x / 3;
			var height = lengthY;

			var material = this.getPartMaterial(tabletop);
			var geometry = CreateDrawer(width, length, height);
			var drawer = new THREE.Mesh(geometry, material);
			drawer.name = "drawer";	
			this.objectRotationByAxis(drawer, "y", - Math.PI / 2);
			var drawerSize = this.getPartSize(drawer);
			

			var drawerArray = [];
			for (var i = 0, offset = 0; i < 3; i++, offset += drawerSize.x/3) {
				drawerArray[i] = new THREE.Object3D();
				drawerArray[i] = drawer.clone();
				var tmp = new THREE.Vector3(boardCenter.x - drawerSize.x/2 - offset, 
					boardCenter.y + 0.12, boardCenter.z - drawerSize.z/2 - width + width*i);
				this.objectAddToFurniture(table, drawerArray[i], tmp);
			}
		}
		
	},

	addRod: function() {
		var table = this.furnitures[0].getFurniture();
		var tabletop = table.getObjectByName("tTop");
		var tabletopCenter = this.getPartCenter(tabletop);
		var tabletopSize = this.getPartSize(tabletop);
		var material = this.getPartMaterial(tabletop);

		if(tabletopSize.x > tabletopSize.z){
			var geometry = CreateTableRod(tabletopSize.z);
			var tableRod = new THREE.Mesh(geometry, material);
			tableRod.name = "tableRod";
			var tableRodSize = this.getPartSize(tableRod);
			var pos = new THREE.Vector3(tabletopCenter.x - tabletopSize.x/2 - tableRodSize.x/2, 
				tabletopCenter.y - tableRodSize.y/2, tabletopCenter.z);
			this.objectAddToFurniture(table, tableRod, pos);
		}
		else{
			var geometry = CreateTableRod(tabletopSize.x);
			var tableRod = new THREE.Mesh(geometry, material);
			tableRod.name = "tableRod";
			this.objectRotationByAxis(tableRod, "y", Math.PI/2);
			var tableRodSize = this.getPartSize(tableRod);
			var pos = new THREE.Vector3(tabletopCenter.x, tabletopCenter.y - tableRodSize.y/2, 
				tabletopCenter.z  + tabletopSize.z/2 + tableRodSize.z/2);
			this.objectAddToFurniture(table, tableRod, pos);
		}
	},

	addSeat: function() {
		var table = this.furnitures[0].getFurniture();
		var tabletop = table.getObjectByName("tTop");
		var tabletopSize = this.getPartSize(tabletop);
		var tabletopCenter = this.getPartCenter(tabletop);

		var geometry = CabinetMakeSeat( tabletopSize.x , tabletopSize.z );
		var texture = new THREE.TextureLoader().load( 'images/material/material2.jpg' );
		var material = new THREE.MeshBasicMaterial( {map: texture} );
		var seat = new THREE.Mesh( geometry, material );
		seat.name = 'seat';
		var seatSize = this.getPartSize(seat);
		var pos = new THREE.Vector3(tabletopCenter.x - seatSize.x/2 + 0.3, tabletopCenter.y, 
			tabletopCenter.z - seatSize.z/2 + 0.3);
		this.objectAddToFurniture(table, seat, pos);
	},

	addDoorBoard: function() {
		var table = this.furnitures[0].getFurniture();	
		var tableSize = this.getPartSize(table);	
		var tabletop = table.getObjectByName("tTop");
		var tabletopSize = this.getPartSize(tabletop);
		var tabletopCenter = this.getPartCenter(tabletop);		
		var material = this.getPartMaterial(tabletop);

		if(tabletopSize.x < tabletopSize.z){
			var geometry = CreateDoorBoard(tabletopSize.x, tableSize.y * 2.5);
			var doorBoard = new THREE.Mesh(geometry, material);
			doorBoard.name = "doorBoard";

			var doorBoardSize = this.getPartSize(doorBoard);
			this.objectRotationByAxis(doorBoard, "y", Math.PI / 2);
			var pos = new THREE.Vector3(tabletopCenter.x, doorBoardSize.y/2, tabletopCenter.z);
			this.objectAddToFurniture(table, doorBoard, pos);

		}
		else{
			var geometry = CreateDoorBoard(tabletopSize.z, tableSize.y * 2.5);
			var doorBoard = new THREE.Mesh(geometry, material);
			doorBoard.name = "doorBoard";
			var doorBoardSize = this.getPartSize(doorBoard);
			var pos = new THREE.Vector3(tabletopCenter.x, doorBoardSize.y/2, tabletopCenter.z);
			this.objectAddToFurniture(table, doorBoard, pos);
		}
		
		
	},

	execute: function(tfname) {
		if(this.furnitures.length > 0){
			console.log("this.furnitures.length > 0");
			var flag = true;
			for (var i = 0; i < this.furnitures.length; i++) {
				flag = flag && this.checkTableInfo(this.furnitures[i]);
			}
			if(flag){
				if(tfname == "stack"){
					this.stackEvent();
				}
				if(tfname == "flipStack"){					
					this.flipStackEvent();					
				}
				if(tfname == "addWheel"){
					this.addWheelEvent();
				}
				if(tfname == "addBoardOnTabletop"){
					this.addBoardOnTabletop();
				}
				if(tfname == "addBoard"){
					this.addBoard();
				}
				if(tfname == "addDrawer"){
					this.addDrawer();
				}
				if(tfname == "addRod"){
					this.addRod();
				}
				if(tfname == "addSeat"){
					this.addSeat();
				}
				if(tfname == "addDoorBoard"){
					this.addDoorBoard();
				}
			}
			else{
				console.log("Exist one table isn't marked tabletop or tableLeg.");
			}			
		}
		else
			console.log("No Table in the scene.");
	}

}

module.exports = Table