"use strict;"

function MarkBetweenSize( main , TargetObj1 , TargetObj2 ){

	var Box 		= new THREE.Box3();
	var objCenter1 	= new THREE.Vector3();
	var objSize1	= new THREE.Vector3();
	var objCenter2 	= new THREE.Vector3();
	var objSize2	= new THREE.Vector3();
	var FuniBox 	= new THREE.Box3();
	var FuniCenter	= new THREE.Vector3();
	var group		= new THREE.Group();
	main.scene.add(group);
	var num = 1;

	//detect the funiture component
	for(var i = main.furnitures.length - 1; i > -1; i -- ){ 
		var object =  main.furnitures[i].getFurniture();
		
		if(object.isObject3D){
			group.add(object.clone());
		}
	}
	for(var i = main.Sceneobjects.length - 1; i > -1; i -- ){

		var object =  main.Sceneobjects[i];
		group.add(object.clone());
	}

	//set funiture bounding box , box center
	FuniBox.setFromObject( group );
	FuniBox.getCenter( FuniCenter );
	main.scene.remove( group );
	
	//get object center
	Box.setFromObject( TargetObj1 );
	Box.getCenter(objCenter1);
	Box.getSize(objSize1);
	Box.setFromObject( TargetObj2 );
	Box.getCenter(objCenter2);
	Box.getSize(objSize2);

	//calculate x
	if( objCenter1.x != objCenter2.x ){
		var length = Math.abs(objCenter1.x - objCenter2.x)-objSize1.x/2-objSize2.x/2;
		
		if(objCenter1.x < objCenter2.x){num = 1;}
		else{num = -1;}
		//front the funiture
		if(objCenter1.z >= FuniCenter.z && length>0){
			loadText( main ,
					length ,
					new THREE.Vector3((objCenter1.x + objCenter2.x)/2,
									  objCenter1.y - objSize1.y/2 ,
									  objCenter1.z + objSize1.z/2 + 1), 
					0 );
			
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + num*objSize1.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z + objSize1.z/2 + 1) ,
					  new THREE.Vector3(objCenter2.x - num*objSize2.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z + objSize1.z/2 + 1));
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + num*objSize1.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z + objSize1.z/2 + 0.5) ,
					  new THREE.Vector3(objCenter1.x + num*objSize1.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z + objSize1.z/2 + 1.5));
			loadLine( main ,
					  new THREE.Vector3(objCenter2.x - num*objSize2.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z + objSize1.z/2 + 0.5) ,
					  new THREE.Vector3(objCenter2.x - num*objSize2.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z + objSize1.z/2 + 1.5));
		}
		//back the funiture
		else if(objCenter1.z < FuniCenter.z && length>0){
			loadText( main ,
					length ,
					new THREE.Vector3((objCenter1.x + objCenter2.x)/2,
									  objCenter1.y - objSize1.y/2 ,
									  objCenter1.z - objSize1.z/2 - 1), 
					180 );

			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + num*objSize1.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - objSize1.z/2 - 1) ,
					  new THREE.Vector3(objCenter2.x - num*objSize2.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - objSize1.z/2 - 1));
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + num*objSize1.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - objSize1.z/2 - 0.5) ,
					  new THREE.Vector3(objCenter1.x + num*objSize1.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - objSize1.z/2 - 1.5));
			loadLine( main ,
					  new THREE.Vector3(objCenter2.x - num*objSize2.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - objSize1.z/2 - 0.5) ,
					  new THREE.Vector3(objCenter2.x - num*objSize2.x/2,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - objSize1.z/2 - 1.5));
		}


	}

	//calculate z
	if( objCenter1.z != objCenter2.z ){
		var length = Math.abs(objCenter1.z - objCenter2.z)-objSize1.z/2-objSize2.z/2;

		if(objCenter1.z > objCenter2.z){num = 1;}
		else{num = -1;}
		//right the funiture
		if(objCenter1.x > FuniCenter.x && length>0){
			loadText( main ,
					length ,
					new THREE.Vector3(objCenter1.x + objSize1.x/2 +1,
									  objCenter1.y - objSize1.y/2 ,
									  (objCenter1.z + objCenter2.z)/2 ),
					90 );
			
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - num*objSize1.z/2) ,
					  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter2.z + num*objSize2.z/2));
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + objSize1.x/2 +0.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - num*objSize1.z/2) ,
					  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - num*objSize1.z/2));
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x + objSize1.x/2 +0.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter2.z + num*objSize2.z/2) ,
					  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter2.z + num*objSize2.z/2));

		}
		//left the funiture
		else if(objCenter1.x <= FuniCenter.x && length>0){
			loadText( main ,
					length ,
					new THREE.Vector3(objCenter1.x - objSize1.x/2 -1,
									  objCenter1.y - objSize1.y/2 ,
									  (objCenter1.z + objCenter2.z)/2 ),
					270 );
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - num*objSize1.z/2) ,
					  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter2.z + num*objSize2.z/2));
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x - objSize1.x/2 -0.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - num*objSize1.z/2) ,
					  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter1.z - num*objSize1.z/2));
			loadLine( main ,
					  new THREE.Vector3(objCenter1.x - objSize1.x/2 -0.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter2.z + num*objSize2.z/2) ,
					  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1.5,
									  	objCenter1.y - objSize1.y/2 ,
									  	objCenter2.z + num*objSize2.z/2));
		}
	}


	//calculate y
	if( objCenter1.y != objCenter2.y ){
		var length = Math.abs(objCenter1.y - objCenter2.y)-objSize1.y/2-objSize2.y/2;
		
		if(objCenter1.y < objCenter2.y){num = 1;}
		else{num = -1;}
		//front the funiture
		if(objCenter1.z >= FuniCenter.z && length>0){
			//right the funiture
			if(objCenter1.x > FuniCenter.x){
				loadText( main ,
						length ,
						new THREE.Vector3(objCenter1.x + objSize1.x/2 + 1,
										  (objCenter1.y + objCenter2.y)/2 ,
										  objCenter1.z + objSize1.z/2 +1),
						45 );
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 + 1,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1) ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 + 1,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1 ));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +0.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z + objSize1.z/2 +0.5) ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1.5));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +0.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z + objSize1.z/2 +0.5) ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1.5));
			}
			else{//right the funiture
				loadText( main ,
						length ,
						new THREE.Vector3(objCenter1.x - objSize1.x/2 - 1,
										  (objCenter1.y + objCenter2.y)/2 ,
										  objCenter1.z + objSize1.z/2 +1),
						-45 );
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 - 1,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1) ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 - 1,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1 ));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -0.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z + objSize1.z/2 +0.5) ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1.5));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -0.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z + objSize1.z/2 +0.5) ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z + objSize1.z/2 +1.5));
			}

		}
		//back the funiture
		else if(objCenter1.z < FuniCenter.z && length>0){
			//right the funiture
			if(objCenter1.x > FuniCenter.x){
				loadText( main ,
						length ,
						new THREE.Vector3(objCenter1.x + objSize1.x/2 + 1,
										  (objCenter1.y + objCenter2.y)/2 ,
										  objCenter1.z - objSize1.z/2 -1),
						135 );
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 + 1,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1) ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 + 1,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1 ));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +0.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z - objSize1.z/2 -0.5) ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1.5));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +0.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z - objSize1.z/2 -0.5) ,
						  new THREE.Vector3(objCenter1.x + objSize1.x/2 +1.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1.5));
			}
			else{//left the funiture
				loadText( main ,
						length ,
						new THREE.Vector3(objCenter1.x - objSize1.x/2 - 1,
										  (objCenter1.y + objCenter2.y)/2 ,
										  objCenter1.z - objSize1.z/2 -1),
						135 );
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 - 1,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1) ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 - 1,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1 ));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -0.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z - objSize1.z/2 -0.5) ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1.5,
										  	objCenter1.y + num*objSize1.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1.5));
				loadLine( main ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -0.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z - objSize1.z/2 -0.5) ,
						  new THREE.Vector3(objCenter1.x - objSize1.x/2 -1.5,
										  	objCenter2.y - num*objSize2.y/2 ,
										  	objCenter1.z - objSize1.z/2 -1.5));
			}

		}

	}

}

function loadText(main , num , position , rotat){
	var text = (Math.round(num*10)/100).toString();
	var loader = new THREE.FontLoader();
	var font = loader.load(
		// resource URL
		'three.js-master/examples/fonts/helvetiker_regular.typeface.json',

		// onLoad callback
		function ( font ) {
			var geometry = new THREE.TextGeometry( text , {
				font: font ,
				size: 0.3,
				height: 0.05,
				curveSegments: 12,
				bevelEnabled: false,
				bevelThickness: 5,
				bevelSize: 4,
				bevelSegments: 1
			} );

			var material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
			var mesh = new THREE.Mesh( geometry, material );

			mesh.position.set( position.x , position.y +0.5 , position.z );
			mesh.rotateOnWorldAxis(new THREE.Vector3(0,1,0) , rotat * Math.PI/180);
			main.scene.add( mesh );
			main.SizeObj.push(mesh);
		}
	);

}
function loadLine( main , point1 , point2){

		var material = new THREE.LineBasicMaterial({
			color: 0x000000,
			linewidth: 10,
			linecap: 'round', //ignored by WebGLRenderer
			linejoin:  'round' //ignored by WebGLRenderer
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( point1.x , point1.y , point1.z ),
			new THREE.Vector3( point2.x , point2.y , point2.z )
		);

		var line = new THREE.Line( geometry, material );
		main.scene.add( line );
		main.SizeObj.push(line);
	}

module.exports = MarkBetweenSize;

